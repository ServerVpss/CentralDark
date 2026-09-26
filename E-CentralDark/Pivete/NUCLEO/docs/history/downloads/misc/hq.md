# OUTRO - hq.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-8.0.4\src\enc\backward_references\hq.rs
**SHA:** 893015ebb46c2b16
**Timestamp:** 2026-08-28T02:33:04.615139
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- block_start: usize,
- let i_start = position - Params::max_tree_comp_length() as usize;
- block_start: usize,
- block_start: usize,
- block_start: usize,
- let start: usize = posdata.pos;

### Gaps
- const BROTLI_WINDOW_GAP: usize = 16;
- let gap: usize = 0usize;
- gap: usize,
- gap: usize,
- gap: usize,
- let gap: usize = 0usize;
- let gap: usize = 0usize;
- gap: usize,
- let gap: usize = 0usize;

### Ouro Bruto (primeiros 5000 chars)
```
use alloc::{Allocator, SliceWrapper, SliceWrapperMut};
use core;
use core::cmp::{max, min};

use super::hash_to_binary_tree::{
    kInfinity, Allocable, BackwardMatch, BackwardMatchMut, H10Params, StoreAndFindMatchesH10,
    Union1, ZopfliNode, H10,
};
use super::{
    fix_unbroken_len, kDistanceCacheIndex, kDistanceCacheOffset, kInvalidMatch, AnyHasher,
    BrotliEncoderParams,
};
use crate::enc::combined_alloc::{alloc_if, alloc_or_default};
use crate::enc::command::{
    combine_length_codes, BrotliDistanceParams, Command, GetCopyLengthCode, GetInsertLengthCode,
    PrefixEncodeCopyDistance,
};
use crate::enc::constants::{kCopyExtra, kInsExtra};
use crate::enc::encode;
use crate::enc::literal_cost::BrotliEstimateBitCostsForLiterals;
use crate::enc::static_dict::{
    BrotliDictionary, BrotliFindAllStaticDictionaryMatches, FindMatchLengthWithLimit,
};
use crate::enc::util::{floatX, FastLog2, FastLog2f64};

const BROTLI_WINDOW_GAP: usize = 16;
const BROTLI_MAX_STATIC_DICTIONARY_MATCH_LEN: usize = 37;

/*
static kBrotliMinWindowBits: i32 = 10i32;

static kBrotliMaxWindowBits: i32 = 24i32;

static kInvalidMatch: u32 = 0xfffffffu32;

static kCutoffTransformsCount: u32 = 10u32;

static kCutoffTransforms: u64 = 0x71b520au64 << 32 | 0xda2d3200u32 as (u64);

pub static kHashMul32: u32 = 0x1e35a7bdu32;

pub static kHashMul64: u64 = 0x1e35a7bdu64 << 32 | 0x1e35a7bdu64;

pub static kHashMul64Long: u64 = 0x1fe35a7bu32 as (u64) << 32 | 0xd3579bd3u32 as (u64);

*/
pub const BROTLI_MAX_EFFECTIVE_DISTANCE_ALPHABET_SIZE: usize = 544;
pub const BROTLI_NUM_LITERAL_SYMBOLS: usize = 256;
pub const BROTLI_NUM_COMMAND_SYMBOLS: usize = 704;

pub const BROTLI_SIMPLE_DISTANCE_ALPHABET_SIZE: usize = encode::BROTLI_NUM_DISTANCE_SHORT_CODES
    as usize
    + (2 * encode::BROTLI_LARGE_MAX_DISTANCE_BITS as usize);

const STORE_LOOKAHEAD_H_10: usize = 128;

#[inline(always)]
pub fn BrotliInitZopfliNodes(array: &mut [ZopfliNode], length: usize) {
    let stub = ZopfliNode::default();
    let mut i: usize;
    i = 0usize;
    while i < length {
        array[i] = stub;
        i = i.wrapping_add(1);
    }
}

impl ZopfliNode {
    #[inline(always)]
    fn copy_length(&self) -> u32 {
        self.length & 0x01ff_ffff
    }

    #[inline(always)]
    fn copy_distance(&self) -> u32 {
        self.distance
    }

    #[inline(always)]
    fn length_code(&self) -> u32 {
        self.copy_length()
            .wrapping_add(9)
            .wrapping_sub(self.length >> 25)
    }

    #[inline(always)]
    fn distance_code(&self) -> u32 {
        let short_code: u32 = self.dcode_insert_length >> 27;
        if short_code == 0u32 {
            self.copy_distance().wrapping_add(16).wrapping_sub(1)
        } else {
            short_code.wrapping_sub(1)
        }
    }
}

pub fn BrotliZopfliCreateCommands(
    num_bytes: usize,
    block_start: usize,
    max_backward_limit: usize,
    nodes: &[ZopfliNode],
    dist_cache: &mut [i32],
    last_insert_len: &mut usize,
    params: &BrotliEncoderParams,
    commands: &mut [Command],
    num_literals: &mut usize,
) {
    let mut pos: usize = 0usize;
    let mut offset: u32 = match (nodes[0]).u {
        Union1::next(off) => off,
        _ => 0,
    };
    let mut i: usize;
    let gap: usize = 0usize;
    i = 0usize;
    while offset != !(0u32) {
        {
            let next: &ZopfliNode = &nodes[pos.wrapping_add(offset as usize)];
            let copy_length = next.copy_length() as usize;
            let mut insert_length: usize = (next.dcode_insert_length & 0x07ff_ffff) as usize;
            pos = pos.wrapping_add(insert_length);
            offset = match next.u {
                Union1::next(off) => off,
                _ => 0,
            };
            if i == 0usize {
                insert_length = insert_length.wrapping_add(*last_insert_len);
                *last_insert_len = 0usize;
            }
            {
                let distance: usize = next.copy_distance() as usize;
                let len_code: usize = next.length_code() as usize;
                let max_distance: usize = min(block_start.wrapping_add(pos), max_backward_limit);
                let is_dictionary = distance > max_distance.wrapping_add(gap);
                let dist_code: usize = next.distance_code() as usize;
                commands[i].init(
                    &params.dist,
                    insert_length,
                    copy_length,
                    len_code,
                    dist_code,
                );
                if !is_dictionary && dist_code > 0 {
                    dist_cache[3] = dist_cache[2];
                    dist_cache[2] = dist_cache[1];
                    dist_cache[1] = dist_cache[0];
                    dist_cache[0] = distance as i32;
                }
            }
            *num_literals = num_literals.wrapping_add(insert_length);
            pos = pos.wrapping_add(copy_length);
        }
        i = i.wrapping_add(1);
    }
    *last_insert_len = last_insert_len.wrapping_
```
# OUTRO - compress_fragment.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-8.0.4\src\enc\compress_fragment.rs
**SHA:** 4a5c57cac99ee509
**Timestamp:** 2026-08-28T02:33:02.309936
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- storage_ix_start: usize,
- let mut metablock_start = 0usize;
- metablock_start = input_index;

### Ouro Bruto (primeiros 5000 chars)
```
use core::cmp::min;

//caution: lots of the functions look structurally the same as two_pass,
// but have subtle index differences
// examples: IsMatch checks p1[4] and p1[5]
// the hoops that BuildAndStoreCommandPrefixCode goes through are subtly different in order
// (eg memcpy x+24, y instead of +24, y+40
// pretty much assume compress_fragment_two_pass is a trap! except for store_meta_block_header
use super::super::alloc;
use super::backward_references::kHashMul32;
use super::brotli_bit_stream::{BrotliBuildAndStoreHuffmanTreeFast, BrotliStoreHuffmanTree};
use super::compress_fragment_two_pass::{memcpy, BrotliWriteBits};
use super::entropy_encode::{
    BrotliConvertBitDepthsToSymbols, BrotliCreateHuffmanTree, HuffmanTree,
};
use super::static_dict::{
    FindMatchLengthWithLimit, BROTLI_UNALIGNED_LOAD32, BROTLI_UNALIGNED_LOAD64,
};
use super::util::{FastLog2, Log2FloorNonZero};
use crate::enc::compress_fragment_two_pass::store_meta_block_header;
use crate::enc::floatX;

//static kHashMul32: u32 = 0x1e35a7bdu32;

static kCmdHistoSeed: [u32; 128] = [
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
];

fn Hash(p: &[u8], shift: usize) -> u32 {
    let h: u64 = (BROTLI_UNALIGNED_LOAD64(p) << 24).wrapping_mul(kHashMul32 as (u64));
    (h >> shift) as u32
}

fn IsMatch(p1: &[u8], p2: &[u8]) -> bool {
    BROTLI_UNALIGNED_LOAD32(p1) == BROTLI_UNALIGNED_LOAD32(p2) && (p1[4] as i32 == p2[4] as i32)
}

fn BuildAndStoreLiteralPrefixCode<AllocHT: alloc::Allocator<HuffmanTree>>(
    mht: &mut AllocHT,
    input: &[u8],
    input_size: usize,
    depths: &mut [u8],
    bits: &mut [u16],
    storage_ix: &mut usize,
    storage: &mut [u8],
) -> usize {
    let mut histogram: [u32; 256] = [0; 256];
    let mut histogram_total: usize;
    let mut i: usize;
    if input_size < (1i32 << 15) as usize {
        for i in 0usize..input_size {
            let _rhs = 1;
            let _lhs = &mut histogram[input[i] as usize];
            *_lhs = (*_lhs).wrapping_add(_rhs as u32);
        }
        histogram_total = input_size;
        i = 0usize;
        while i < 256usize {
            {
                let adjust: u32 = (2u32).wrapping_mul(min(histogram[i], 11u32));
                {
                    let _rhs = adjust;
                    let _lhs = &mut histogram[i];
                    *_lhs = (*_lhs).wrapping_add(_rhs);
                }
                histogram_total = histogram_total.wrapping_add(adjust as usize);
            }
            i = i.wrapping_add(1);
        }
    } else {
        static kSampleRate: usize = 29usize;
        i = 0usize;
        while i < input_size {
            {
                let _rhs = 1;
                let _lhs = &mut histogram[input[i] as usize];
                *_lhs = (*_lhs).wrapping_add(_rhs as u32);
            }
            i = i.wrapping_add(kSampleRate);
        }
        histogram_total = input_size
            .wrapping_add(kSampleRate)
            .wrapping_sub(1)
            .wrapping_div(kSampleRate);
        i = 0usize;
        while i < 256usize {
            {
                let adjust: u32 =
                    (1u32).wrapping_add((2u32).wrapping_mul(min(histogram[i], 11u32)));
                {
                    let _rhs = adjust;
                    let _lhs = &mut histogram[i];
                    *_lhs = (*_lhs).wrapping_add(_rhs);
                }
                histogram_total = histogram_total.wrapping_add(adjust as usize);
            }
            i = i.wrapping_add(1);
        }
    }
    BrotliBuildAndStoreHuffmanTreeFast(
        mht,
        &mut histogram[..],
        histogram_total,
        8usize,
        depths,
        bits,
        storage_ix,
        storage,
    );
    {
        let mut literal_ratio: usize = 0usize;
        for i in 0usize..256usize {
            if histogram[i] != 0 {
                literal_ratio = literal_ratio
                    .wrapping_add(histogram[i].wrapping_mul(depths[i] as u32) as usize);
            }
        }
        literal_ratio
            .wrapping_mul(125)
            .wrapping_div(histogram_total)
    }
}
#[derive(PartialEq, Eq, Copy, Clone)]
pub enum CodeBlockState {
    EMIT_REMAINDER,
    EMIT_COMMANDS,
    NEXT_BLOCK,
}

fn EmitInsertLen(
    insertlen: usize,
    depth: &[u8],
    bits: &[u16],
    histo: &mut [u32],
    storage_ix: &mut usize,
    storage: &mut [u8],
) {
    if insertlen < 6usize {
        let code: usize = insertlen.wrapping_add(40);
        BrotliWriteBits(
            depth[code] as usize,
            bits[code] as (u64),
            storage_ix,
            storage,
        );
        {
            let _rhs = 1;
            let 
```
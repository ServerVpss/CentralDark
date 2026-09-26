# OUTRO - decode.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-decompressor-5.0.3\src\decode.rs
**SHA:** 79896b38285f417f
**Timestamp:** 2026-08-28T02:33:06.062433
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = fast_slice!((s.ringbuffer)[start_index ; start_index + num_written as usize]);
- let src_start = ((pos - s.distance_code) & s.ringbuffer_mask) as u32;
- let dst_start = pos as u32;

### Gaps
- const kBrotliWindowGap: u32 = 16;

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(non_snake_case)]
#![allow(unused_parens)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(non_upper_case_globals)]
#![allow(unused_macros)]

// #[macro_use] //<- for debugging, remove xprintln from bit_reader and replace with println
// extern crate std;
use core;
use super::alloc;
pub use alloc::{AllocatedStackMemory, Allocator, SliceWrapper, SliceWrapperMut, StackAllocator};

use core::mem;

use super::bit_reader;
use super::huffman;
use super::state;
use super::prefix;

use super::transform::{TransformDictionaryWord, kNumTransforms};
use state::{BlockTypeAndLengthState, BrotliRunningContextMapState, BrotliRunningDecodeUint8State,
            BrotliRunningHuffmanState, BrotliRunningMetablockHeaderState,
            BrotliRunningReadBlockLengthState, BrotliRunningState, BrotliRunningTreeGroupState,
            BrotliRunningUncompressedState, kLiteralContextBits,
            BrotliDecoderErrorCode,
};
use context::{kContextLookup};
use ::dictionary::{kBrotliDictionary, kBrotliDictionaryOffsetsByLength,
                   kBrotliDictionarySizeBitsByLength, kBrotliMaxDictionaryWordLength,
                   kBrotliMinDictionaryWordLength};
pub use huffman::{HuffmanCode, HuffmanTreeGroup};
#[repr(C)]
#[derive(Debug)]
pub enum BrotliResult {
  ResultSuccess = 1,
  NeedsMoreInput = 2,
  NeedsMoreOutput = 3,
  ResultFailure = 0,
}
const kBrotliWindowGap: u32 = 16;
const kBrotliLargeMinWbits: u32 = 10;
const kBrotliLargeMaxWbits: u32 = 30;
const kBrotliMaxPostfix: usize = 3;
const kBrotliMaxAllowedDistance: u32 = 0x7FFFFFFC;
const kDefaultCodeLength: u32 = 8;
const kCodeLengthRepeatCode: u32 = 16;
pub const kNumLiteralCodes: u16 = 256;
pub const kNumInsertAndCopyCodes: u16 = 704;
pub const kNumBlockLengthCodes: u32 = 26;
const kDistanceContextBits: i32 = 2;
const HUFFMAN_TABLE_BITS: u32 = 8;
const HUFFMAN_TABLE_MASK: u32 = 0xff;
const CODE_LENGTH_CODES: usize = 18;
const kCodeLengthCodeOrder: [u8; CODE_LENGTH_CODES] = [1, 2, 3, 4, 0, 5, 17, 6, 16, 7, 8, 9, 10,
                                                       11, 12, 13, 14, 15];

// Static prefix code for the complex code length code lengths.
const kCodeLengthPrefixLength: [u8; 16] = [2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2, 3, 2, 2, 2, 4];

const kCodeLengthPrefixValue: [u8; 16] = [0, 4, 3, 2, 0, 4, 3, 1, 0, 4, 3, 2, 0, 4, 3, 5];


macro_rules! BROTLI_LOG_UINT (
    ($num : expr) => {
       xprintln!("{:?} = {:?}", stringify!($num),  $num)
    };
);

macro_rules! BROTLI_LOG (
    ($str : expr, $num : expr) => {xprintln!("{:?} {:?}", $str, $num);};
    ($str : expr, $num0 : expr, $num1 : expr) => {xprintln!("{:?} {:?} {:?}", $str, $num0, $num1);};
    ($str : expr, $num0 : expr, $num1 : expr, $num2 : expr) => {
        xprintln!("{:?} {:?} {:?} {:?}", $str, $num0, $num1, $num2);
    };
    ($str : expr, $num0 : expr, $num1 : expr, $num2 : expr, $num3 : expr) => {
        xprintln!("{:?} {:?} {:?} {:?} {:?}", $str, $num0, $num1, $num2, $num3);
    };
);
fn is_fatal(e: BrotliDecoderErrorCode) -> bool {
  (e as i64) < 0
}
fn assign_error_code(output: &mut BrotliDecoderErrorCode, input: BrotliDecoderErrorCode) -> BrotliDecoderErrorCode {
  *output = input;
  input
}

#[allow(non_snake_case)]
macro_rules! SaveErrorCode {
  ($state: expr, $e:expr) => {
    match assign_error_code(&mut $state.error_code, $e) {
      BrotliDecoderErrorCode::BROTLI_DECODER_SUCCESS =>
        BrotliResult::ResultSuccess,
      BrotliDecoderErrorCode::BROTLI_DECODER_NEEDS_MORE_INPUT =>
        BrotliResult::NeedsMoreInput,
      BrotliDecoderErrorCode::BROTLI_DECODER_NEEDS_MORE_OUTPUT =>
        BrotliResult::NeedsMoreOutput,
      _ =>
        BrotliResult::ResultFailure,
    }
  }
}
macro_rules! SaveResult {
  ($state: expr, $e:expr) => {
    match ($state.error_code = match $e  {
      BrotliResult::ResultSuccess => BrotliDecoderErrorCode::BROTLI_DECODER_SUCCESS,
      BrotliResult::NeedsMoreInput => BrotliDecoderErrorCode::BROTLI_DECODER_NEEDS_MORE_INPUT,
      BrotliResult::NeedsMoreOutput => BrotliDecoderErrorCode::BROTLI_DECODER_NEEDS_MORE_OUTPUT,
      BrotliResult::ResultFailure => BrotliDecoderErrorCode::BROTLI_DECODER_ERROR_UNREACHABLE,
    }) {
      BrotliDecoderErrorCode::BROTLI_DECODER_SUCCESS =>
        BrotliResult::ResultSuccess,
      BrotliDecoderErrorCode::BROTLI_DECODER_NEEDS_MORE_INPUT =>
        BrotliResult::NeedsMoreInput,
      BrotliDecoderErrorCode::BROTLI_DECODER_NEEDS_MORE_OUTPUT =>
        BrotliResult::NeedsMoreOutput,
      _ =>
        BrotliResult::ResultFailure,
    }
  }
}
macro_rules! BROTLI_LOG_ARRAY_INDEX (
    ($array : expr, $index : expr) => {
       xprintln!("{:?}[{:?}] = {:?}", stringify!($array), $index,  $array[$index as usize])
    };
);


const NUM_DISTANCE_SHORT_CODES: u32 = 16;
pub const BROTLI_MAX_DISTANCE_BITS:u32 = 24;

pub const BROTLI_LARGE_MAX_DISTANCE_BITS: u32 = 62;

pub fn BROTLI_DISTANCE_ALPHABET_SIZE(NPOSTFIX: u32, NDIRECT:u32, MAXNBITS: u32) -> u32 {
    NUM_DISTANCE_SHORT_CODES + (NDIRECT) +
        
```
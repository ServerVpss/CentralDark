# OUTRO - brotli_bit_stream.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-8.0.4\src\enc\brotli_bit_stream.rs
**SHA:** 951ffd10ec129315
**Timestamp:** 2026-08-28T02:33:02.136578
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: delete unused fields

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(unknown_lints)]
#![allow(unused_macros)]

use core::cmp::{max, min};
#[cfg(feature = "std")]
use std::io::Write;

use super::super::alloc::{Allocator, SliceWrapper, SliceWrapperMut};
use super::super::dictionary::{
    kBrotliDictionary, kBrotliDictionaryOffsetsByLength, kBrotliDictionarySizeBitsByLength,
};
use super::super::transform::TransformDictionaryWord;
use super::super::{alloc, core};
use super::block_split::BlockSplit;
use super::combined_alloc::BrotliAlloc;
use super::command::{Command, GetCopyLengthCode, GetInsertLengthCode};
use super::constants::{
    kCodeLengthBits, kCodeLengthDepth, kCopyBase, kCopyExtra, kInsBase, kInsExtra,
    kNonZeroRepsBits, kNonZeroRepsDepth, kSigned3BitContextLookup, kStaticCommandCodeBits,
    kStaticCommandCodeDepth, kStaticDistanceCodeBits, kStaticDistanceCodeDepth, kUTF8ContextLookup,
    kZeroRepsBits, kZeroRepsDepth, BROTLI_CONTEXT_LUT, BROTLI_NUM_BLOCK_LEN_SYMBOLS,
    BROTLI_NUM_COMMAND_SYMBOLS, BROTLI_NUM_HISTOGRAM_DISTANCE_SYMBOLS, BROTLI_NUM_LITERAL_SYMBOLS,
};
use super::context_map_entropy::{speed_to_tuple, ContextMapEntropy, SpeedAndMax};
use super::entropy_encode::{
    BrotliConvertBitDepthsToSymbols, BrotliCreateHuffmanTree, BrotliSetDepth,
    BrotliWriteHuffmanTree, HuffmanComparator, HuffmanTree, SortHuffmanTreeItems,
};
use super::histogram::{
    ContextType, HistogramAddItem, HistogramCommand, HistogramDistance, HistogramLiteral,
};
use super::input_pair::{InputPair, InputReference, InputReferenceMut};
use super::interface::StaticCommand;
use super::static_dict::kNumDistanceCacheEntries;
use super::util::floatX;
use super::{find_stride, interface, prior_eval, stride_eval};
use crate::enc::backward_references::BrotliEncoderParams;
use crate::enc::combined_alloc::{alloc_default, alloc_or_default, allocate};
use crate::VERSION;

pub struct PrefixCodeRange {
    pub offset: u32,
    pub nbits: u32,
}
pub const MAX_SIMPLE_DISTANCE_ALPHABET_SIZE: usize = 140;

fn window_size_from_lgwin(lgwin: i32) -> usize {
    (1 << lgwin) - 16usize
}

struct CommandQueue<'a, Alloc: BrotliAlloc + 'a> {
    mb: InputPair<'a>,
    // TODO: delete unused fields
    #[allow(dead_code)]
    mb_byte_offset: usize,
    mc: &'a mut Alloc,
    queue: <Alloc as Allocator<StaticCommand>>::AllocatedMemory,
    pred_mode: interface::PredictionModeContextMap<InputReferenceMut<'a>>,
    loc: usize,
    entropy_tally_scratch: find_stride::EntropyTally<Alloc>,
    best_strides_per_block_type: <Alloc as Allocator<u8>>::AllocatedMemory,
    entropy_pyramid: find_stride::EntropyPyramid<Alloc>,
    context_map_entropy: ContextMapEntropy<'a, Alloc>,
    #[allow(dead_code)]
    stride_detection_quality: u8,
    #[allow(dead_code)]
    high_entropy_detection_quality: u8,
    block_type_literal: u8,
    #[allow(dead_code)]
    best_stride_index: usize,
    overfull: bool,
}

impl<'a, Alloc: BrotliAlloc> CommandQueue<'a, Alloc> {
    fn new(
        alloc: &'a mut Alloc,
        num_commands: usize,
        pred_mode: interface::PredictionModeContextMap<InputReferenceMut<'a>>,
        mb: InputPair<'a>,
        stride_detection_quality: u8,
        high_entropy_detection_quality: u8,
        context_map_entropy: ContextMapEntropy<'a, Alloc>,
        best_strides: <Alloc as Allocator<u8>>::AllocatedMemory,
        entropy_tally_scratch: find_stride::EntropyTally<Alloc>,
        entropy_pyramid: find_stride::EntropyPyramid<Alloc>,
    ) -> CommandQueue<'a, Alloc> {
        // assume no more than 1/16 of the stream is block_types which may chop up literals
        // also there's the first btypel and a potential wrap around the ring buffer
        let queue = allocate::<StaticCommand, _>(alloc, num_commands * 17 / 16 + 4);
        CommandQueue {
            mc: alloc,
            queue, // always need a spare command in case the ring buffer splits a literal into two
            pred_mode,
            mb,
            mb_byte_offset: 0,
            loc: 0,
            best_strides_per_block_type: best_strides,
            entropy_tally_scratch,
            entropy_pyramid,
            stride_detection_quality,
            high_entropy_detection_quality,
            context_map_entropy,
            block_type_literal: 0,
            best_stride_index: 0,
            overfull: false,
        }
    }
    fn full(&self) -> bool {
        self.loc == self.queue.len()
    }
    fn error_if_full(&mut self) {
        if self.full() {
            self.overfull = true;
        }
    }
    fn clear(&mut self) {
        self.loc = 0;
        self.block_type_literal = 0;
    }
    fn free<Cb>(&mut self, callback: &mut Cb) -> Result<(), ()>
    where
        Cb: FnMut(
            &mut interface::PredictionModeContextMap<InputReferenceMut>,
            &mut [interface::StaticCommand],
            InputPair,
            &mut Alloc,
        ),
    {
        callback(
            &mut self.pred_mode,
            self.queue.slice_mut().split_at_mut(self.loc).0,
            self.mb,
            self.mc,

```
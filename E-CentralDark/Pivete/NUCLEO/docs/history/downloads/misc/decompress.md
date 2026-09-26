# OUTRO - decompress.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\fdeflate-0.3.7\src\decompress.rs
**SHA:** 26eea8e94c41422b
**Timestamp:** 2026-08-28T02:34:07.281831
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.peak_bits(3);
- let start = output_index - dist;
- let start = output_index - dist;

### Gaps
- // TODO: is this right?
- // TODO: Return a dedicated error in this case.

### Ouro Bruto (primeiros 5000 chars)
```
use simd_adler32::Adler32;

use crate::{
    huffman::{self, build_table},
    tables::{
        self, CLCL_ORDER, DIST_SYM_TO_DIST_BASE, DIST_SYM_TO_DIST_EXTRA, FIXED_DIST_TABLE,
        FIXED_LITLEN_TABLE, LEN_SYM_TO_LEN_BASE, LEN_SYM_TO_LEN_EXTRA, LITLEN_TABLE_ENTRIES,
    },
};

/// An error encountered while decompressing a deflate stream.
#[derive(Debug, PartialEq)]
pub enum DecompressionError {
    /// The zlib header is corrupt.
    BadZlibHeader,
    /// All input was consumed, but the end of the stream hasn't been reached.
    InsufficientInput,
    /// A block header specifies an invalid block type.
    InvalidBlockType,
    /// An uncompressed block's NLEN value is invalid.
    InvalidUncompressedBlockLength,
    /// Too many literals were specified.
    InvalidHlit,
    /// Too many distance codes were specified.
    InvalidHdist,
    /// Attempted to repeat a previous code before reading any codes, or past the end of the code
    /// lengths.
    InvalidCodeLengthRepeat,
    /// The stream doesn't specify a valid huffman tree.
    BadCodeLengthHuffmanTree,
    /// The stream doesn't specify a valid huffman tree.
    BadLiteralLengthHuffmanTree,
    /// The stream doesn't specify a valid huffman tree.
    BadDistanceHuffmanTree,
    /// The stream contains a literal/length code that was not allowed by the header.
    InvalidLiteralLengthCode,
    /// The stream contains a distance code that was not allowed by the header.
    InvalidDistanceCode,
    /// The stream contains contains back-reference as the first symbol.
    InputStartsWithRun,
    /// The stream contains a back-reference that is too far back.
    DistanceTooFarBack,
    /// The deflate stream checksum is incorrect.
    WrongChecksum,
    /// Extra input data.
    ExtraInput,
}

struct BlockHeader {
    hlit: usize,
    hdist: usize,
    hclen: usize,
    num_lengths_read: usize,

    /// Low 3-bits are code length code length, high 5-bits are code length code.
    table: [u32; 128],
    code_lengths: [u8; 320],
}

pub const LITERAL_ENTRY: u32 = 0x8000;
pub const EXCEPTIONAL_ENTRY: u32 = 0x4000;
pub const SECONDARY_TABLE_ENTRY: u32 = 0x2000;

/// The Decompressor state for a compressed block.
#[derive(Eq, PartialEq, Debug)]
struct CompressedBlock {
    litlen_table: Box<[u32; 4096]>,
    secondary_table: Vec<u16>,

    dist_table: Box<[u32; 512]>,
    dist_secondary_table: Vec<u16>,

    eof_code: u16,
    eof_mask: u16,
    eof_bits: u8,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq)]
enum State {
    ZlibHeader,
    BlockHeader,
    CodeLengthCodes,
    CodeLengths,
    CompressedData,
    UncompressedData,
    Checksum,
    Done,
}

/// Decompressor for arbitrary zlib streams.
pub struct Decompressor {
    /// State for decoding a compressed block.
    compression: CompressedBlock,
    // State for decoding a block header.
    header: BlockHeader,
    // Number of bytes left for uncompressed block.
    uncompressed_bytes_left: u16,

    buffer: u64,
    nbits: u8,

    queued_rle: Option<(u8, usize)>,
    queued_backref: Option<(usize, usize)>,
    last_block: bool,
    fixed_table: bool,

    state: State,
    checksum: Adler32,
    ignore_adler32: bool,
}

impl Default for Decompressor {
    fn default() -> Self {
        Self::new()
    }
}

impl Decompressor {
    /// Create a new decompressor.
    pub fn new() -> Self {
        Self {
            buffer: 0,
            nbits: 0,
            compression: CompressedBlock {
                litlen_table: Box::new([0; 4096]),
                dist_table: Box::new([0; 512]),
                secondary_table: Vec::new(),
                dist_secondary_table: Vec::new(),
                eof_code: 0,
                eof_mask: 0,
                eof_bits: 0,
            },
            header: BlockHeader {
                hlit: 0,
                hdist: 0,
                hclen: 0,
                table: [0; 128],
                num_lengths_read: 0,
                code_lengths: [0; 320],
            },
            uncompressed_bytes_left: 0,
            queued_rle: None,
            queued_backref: None,
            checksum: Adler32::new(),
            state: State::ZlibHeader,
            last_block: false,
            ignore_adler32: false,
            fixed_table: false,
        }
    }

    /// Ignore the checksum at the end of the stream.
    pub fn ignore_adler32(&mut self) {
        self.ignore_adler32 = true;
    }

    fn fill_buffer(&mut self, input: &mut &[u8]) {
        if input.len() >= 8 {
            self.buffer |= u64::from_le_bytes(input[..8].try_into().unwrap()) << self.nbits;
            *input = &input[(63 - self.nbits as usize) / 8..];
            self.nbits |= 56;
        } else {
            let nbytes = input.len().min((63 - self.nbits as usize) / 8);
            let mut input_data = [0; 8];
            input_data[..nbytes].copy_from_slice(&input[..nbytes]);
            self.buffer |= u64::from_le_bytes(input_data)
                .checked_shl(self.nbits as u
```
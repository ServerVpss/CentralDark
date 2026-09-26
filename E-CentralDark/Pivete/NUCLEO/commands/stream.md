# COMANDO - stream.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\miniz_oxide-0.8.9\src\inflate\stream.rs
**SHA:** c7ae319dff661e0e
**Timestamp:** 2026-08-28T02:34:49.741548
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- /// TODO: Could probably do this a bit cleaner with some
- /// TODO: This should be stored in the decompressor.

### Ouro Bruto (primeiros 5000 chars)
```
//! Extra streaming decompression functionality.
//!
//! As of now this is mainly intended for use to build a higher-level wrapper.
#[cfg(feature = "with-alloc")]
use crate::alloc::boxed::Box;
use core::{cmp, mem};

use crate::inflate::core::{decompress, inflate_flags, DecompressorOxide, TINFL_LZ_DICT_SIZE};
use crate::inflate::TINFLStatus;
use crate::{DataFormat, MZError, MZFlush, MZResult, MZStatus, StreamResult};

/// Tag that determines reset policy of [InflateState](struct.InflateState.html)
pub trait ResetPolicy {
    /// Performs reset
    fn reset(&self, state: &mut InflateState);
}

/// Resets state, without performing expensive ops (e.g. zeroing buffer)
///
/// Note that not zeroing buffer can lead to security issues when dealing with untrusted input.
pub struct MinReset;

impl ResetPolicy for MinReset {
    fn reset(&self, state: &mut InflateState) {
        state.decompressor().init();
        state.dict_ofs = 0;
        state.dict_avail = 0;
        state.first_call = true;
        state.has_flushed = false;
        state.last_status = TINFLStatus::NeedsMoreInput;
    }
}

/// Resets state and zero memory, continuing to use the same data format.
pub struct ZeroReset;

impl ResetPolicy for ZeroReset {
    #[inline]
    fn reset(&self, state: &mut InflateState) {
        MinReset.reset(state);
        state.dict = [0; TINFL_LZ_DICT_SIZE];
    }
}

/// Full reset of the state, including zeroing memory.
///
/// Requires to provide new data format.
pub struct FullReset(pub DataFormat);

impl ResetPolicy for FullReset {
    #[inline]
    fn reset(&self, state: &mut InflateState) {
        ZeroReset.reset(state);
        state.data_format = self.0;
    }
}

/// A struct that compbines a decompressor with extra data for streaming decompression.
///
#[derive(Clone)]
pub struct InflateState {
    /// Inner decompressor struct
    decomp: DecompressorOxide,

    /// Buffer of input bytes for matches.
    /// TODO: Could probably do this a bit cleaner with some
    /// Cursor-like class.
    /// We may also look into whether we need to keep a buffer here, or just one in the
    /// decompressor struct.
    dict: [u8; TINFL_LZ_DICT_SIZE],
    /// Where in the buffer are we currently at?
    dict_ofs: usize,
    /// How many bytes of data to be flushed is there currently in the buffer?
    dict_avail: usize,

    first_call: bool,
    has_flushed: bool,

    /// Whether the input data is wrapped in a zlib header and checksum.
    /// TODO: This should be stored in the decompressor.
    data_format: DataFormat,
    last_status: TINFLStatus,
}

impl Default for InflateState {
    fn default() -> Self {
        InflateState {
            decomp: DecompressorOxide::default(),
            dict: [0; TINFL_LZ_DICT_SIZE],
            dict_ofs: 0,
            dict_avail: 0,
            first_call: true,
            has_flushed: false,
            data_format: DataFormat::Raw,
            last_status: TINFLStatus::NeedsMoreInput,
        }
    }
}
impl InflateState {
    /// Create a new state.
    ///
    /// Note that this struct is quite large due to internal buffers, and as such storing it on
    /// the stack is not recommended.
    ///
    /// # Parameters
    /// `data_format`: Determines whether the compressed data is assumed to wrapped with zlib
    /// metadata.
    pub fn new(data_format: DataFormat) -> InflateState {
        InflateState {
            data_format,
            ..Default::default()
        }
    }

    /// Create a new state on the heap.
    ///
    /// # Parameters
    /// `data_format`: Determines whether the compressed data is assumed to wrapped with zlib
    /// metadata.
    #[cfg(feature = "with-alloc")]
    pub fn new_boxed(data_format: DataFormat) -> Box<InflateState> {
        let mut b: Box<InflateState> = Box::default();
        b.data_format = data_format;
        b
    }

    /// Access the innner decompressor.
    pub fn decompressor(&mut self) -> &mut DecompressorOxide {
        &mut self.decomp
    }

    /// Return the status of the last call to `inflate` with this `InflateState`.
    pub const fn last_status(&self) -> TINFLStatus {
        self.last_status
    }

    /// Create a new state using miniz/zlib style window bits parameter.
    ///
    /// The decompressor does not support different window sizes. As such,
    /// any positive (>0) value will set the zlib header flag, while a negative one
    /// will not.
    #[cfg(feature = "with-alloc")]
    pub fn new_boxed_with_window_bits(window_bits: i32) -> Box<InflateState> {
        let mut b: Box<InflateState> = Box::default();
        b.data_format = DataFormat::from_window_bits(window_bits);
        b
    }

    #[inline]
    /// Reset the decompressor without re-allocating memory, using the given
    /// data format.
    pub fn reset(&mut self, data_format: DataFormat) {
        self.reset_as(FullReset(data_format));
    }

    #[inline]
    /// Resets the state according to specified policy.
    pub fn reset_as<T: R
```

---

# COMANDO - stream.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\png-0.17.16\src\decoder\stream.rs
**SHA:** 2ce566b959d29ef0
**Timestamp:** 2026-08-28T02:34:59.214783
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- /// TODO: fields with relevant data.
- // TODO: Wrap more info in the enum variant
- // TODO: Calculate **exact** IDAT size for interlaced images.
- // TODO: do we want to display the bad bounds?
- // TODO: Should this return an error instead?  For now let's just have test assertions for

### Ouro Bruto (primeiros 5000 chars)
```
use std::convert::TryInto;
use std::error;
use std::fmt;
use std::io;
use std::{borrow::Cow, cmp::min};

use crc32fast::Hasher as Crc32;

use super::zlib::ZlibStream;
use crate::chunk::{self, ChunkType, IDAT, IEND, IHDR};
use crate::common::{
    AnimationControl, BitDepth, BlendOp, ColorType, ContentLightLevelInfo, DisposeOp, FrameControl,
    Info, MasteringDisplayColorVolume, ParameterError, ParameterErrorKind, PixelDimensions,
    ScaledFloat, SourceChromaticities, Unit,
};
use crate::text_metadata::{ITXtChunk, TEXtChunk, TextDecodingError, ZTXtChunk};
use crate::traits::ReadBytesExt;
use crate::{CodingIndependentCodePoints, Limits};

/// TODO check if these size are reasonable
pub const CHUNK_BUFFER_SIZE: usize = 32 * 1024;

/// Determines if checksum checks should be disabled globally.
///
/// This is used only in fuzzing. `afl` automatically adds `--cfg fuzzing` to RUSTFLAGS which can
/// be used to detect that build.
const CHECKSUM_DISABLED: bool = cfg!(fuzzing);

/// Kind of `u32` value that is being read via `State::U32`.
#[derive(Debug)]
enum U32ValueKind {
    /// First 4 bytes of the PNG signature - see
    /// http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html#PNG-file-signature
    Signature1stU32,
    /// Second 4 bytes of the PNG signature - see
    /// http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html#PNG-file-signature
    Signature2ndU32,
    /// Chunk length - see
    /// http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html#Chunk-layout
    Length,
    /// Chunk type - see
    /// http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html#Chunk-layout
    Type { length: u32 },
    /// Chunk checksum - see
    /// http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html#Chunk-layout
    Crc(ChunkType),
    /// Sequence number from an `fdAT` chunk - see
    /// https://wiki.mozilla.org/APNG_Specification#.60fdAT.60:_The_Frame_Data_Chunk
    ApngSequenceNumber,
}

#[derive(Debug)]
enum State {
    /// In this state we are reading a u32 value from external input.  We start with
    /// `accumulated_count` set to `0`. After reading or accumulating the required 4 bytes we will
    /// call `parse_32` which will then move onto the next state.
    U32 {
        kind: U32ValueKind,
        bytes: [u8; 4],
        accumulated_count: usize,
    },
    /// In this state we are reading chunk data from external input, and appending it to
    /// `ChunkState::raw_bytes`.
    ReadChunkData(ChunkType),
    /// In this state we check if all chunk data has been already read into `ChunkState::raw_bytes`
    /// and if so then we parse the chunk.  Otherwise, we go back to the `ReadChunkData` state.
    ParseChunkData(ChunkType),
    /// In this state we are reading image data from external input and feeding it directly into
    /// `StreamingDecoder::inflater`.
    ImageData(ChunkType),
}

impl State {
    fn new_u32(kind: U32ValueKind) -> Self {
        Self::U32 {
            kind,
            bytes: [0; 4],
            accumulated_count: 0,
        }
    }
}

#[derive(Debug)]
/// Result of the decoding process
pub enum Decoded {
    /// Nothing decoded yet
    Nothing,
    Header(u32, u32, BitDepth, ColorType, bool),
    ChunkBegin(u32, ChunkType),
    ChunkComplete(u32, ChunkType),
    PixelDimensions(PixelDimensions),
    AnimationControl(AnimationControl),
    FrameControl(FrameControl),
    /// Decoded raw image data.
    ImageData,
    /// The last of a consecutive chunk of IDAT was done.
    /// This is distinct from ChunkComplete which only marks that some IDAT chunk was completed but
    /// not that no additional IDAT chunk follows.
    ImageDataFlushed,
    PartialChunk(ChunkType),
    ImageEnd,
}

/// Any kind of error during PNG decoding.
///
/// This enumeration provides a very rough analysis on the origin of the failure. That is, each
/// variant corresponds to one kind of actor causing the error. It should not be understood as a
/// direct blame but can inform the search for a root cause or if such a search is required.
#[derive(Debug)]
pub enum DecodingError {
    /// An error in IO of the underlying reader.
    ///
    /// Note that some IO errors may be recoverable - decoding may be retried after the
    /// error is resolved.  For example, decoding from a slow stream of data (e.g. decoding from a
    /// network stream) may occasionally result in [std::io::ErrorKind::UnexpectedEof] kind of
    /// error, but decoding can resume when more data becomes available.
    IoError(io::Error),
    /// The input image was not a valid PNG.
    ///
    /// There isn't a lot that can be done here, except if the program itself was responsible for
    /// creating this image then investigate the generator. This is internally implemented with a
    /// large Enum. If You are interested in accessing some of the more exact information on the
    /// variant then we can discuss in an issue.
    Format(FormatError),
    /// An interface was used incorrectly.
    ///
    /// This is use
```
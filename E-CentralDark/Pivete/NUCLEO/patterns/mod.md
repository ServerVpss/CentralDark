# PADRAO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-8.0.4\src\enc\backward_references\mod.rs
**SHA:** 490ded64aea202e9
**Timestamp:** 2026-08-28T02:33:04.392446
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn StoreRange(&mut self, data: &[u8], mask: usize, ix_start: usize, ix_end: usize);
- fn BulkStoreRange(&mut self, data: &[u8], mask: usize, ix_start: usize, ix_end: usize);
- ix_start: usize,
- fn StoreRange(&mut self, data: &[u8], mask: usize, ix_start: usize, ix_end: usize) {
- fn BulkStoreRange(&mut self, data: &[u8], mask: usize, ix_start: usize, ix_end: usize) {
- fn StoreRange(&mut self, data: &[u8], mask: usize, ix_start: usize, ix_end: usize) {
- fn BulkStoreRange(&mut self, data: &[u8], mask: usize, ix_start: usize, ix_end: usize) {
- ix_start: usize,
- ix_start: usize,
- ix_start: usize,

### Gaps
- gap: usize,
- gap: usize,
- gap: usize,
- gap: usize,
- gap: usize,
- let gap = 0usize;

### Ouro Bruto (primeiros 5000 chars)
```
mod benchmark;
pub mod hash_to_binary_tree;
pub mod hq;
mod test;

use core::cmp::{max, min};

use super::super::alloc::{Allocator, SliceWrapper, SliceWrapperMut};
use super::command::{BrotliDistanceParams, Command, ComputeDistanceCode};
use super::dictionary_hash::kStaticDictionaryHash;
use super::hash_to_binary_tree::{H10Buckets, H10DefaultParams, ZopfliNode, H10};
use super::static_dict::{
    BrotliDictionary, FindMatchLengthWithLimit, FindMatchLengthWithLimitMin4,
    BROTLI_UNALIGNED_LOAD32, BROTLI_UNALIGNED_LOAD64,
};
use super::util::{floatX, Log2FloorNonZero};
use crate::enc::combined_alloc::allocate;

pub static kInvalidMatch: u32 = 0x0fff_ffff;
static kCutoffTransformsCount: u32 = 10;
static kCutoffTransforms: u64 = 0x071b_520a_da2d_3200;
pub static kHashMul32: u32 = 0x1e35_a7bd;
pub static kHashMul64: u64 = 0x1e35_a7bd_1e35_a7bd;
pub static kHashMul64Long: u64 = 0x1fe3_5a7b_d357_9bd3;

#[derive(PartialEq, Eq, Copy, Clone, Debug)]
#[repr(C)]
pub enum BrotliEncoderMode {
    BROTLI_MODE_GENERIC = 0,
    BROTLI_MODE_TEXT = 1,
    BROTLI_MODE_FONT = 2,
    BROTLI_FORCE_LSB_PRIOR = 3,
    BROTLI_FORCE_MSB_PRIOR = 4,
    BROTLI_FORCE_UTF8_PRIOR = 5,
    BROTLI_FORCE_SIGNED_PRIOR = 6,
}

/// This code takes a length and checks if there's an "end of dictionary" marker at the
///  "ring_buffer_break"point. This marks where a backwards reference cannot pull data through.
/// A match must stop at the end of the dictionary and cannot span the end of the dictionary
/// and beginning of the file.  ring_buffer_break is only set true for custom LZ77 dictionary.
fn fix_unbroken_len(
    unbroken_len: usize,
    prev_ix: usize,
    _cur_ix_masked: usize,
    ring_buffer_break: Option<core::num::NonZeroUsize>,
) -> usize {
    if let Some(br) = ring_buffer_break {
        if prev_ix < usize::from(br) && prev_ix + unbroken_len > usize::from(br) {
            return usize::from(br) - prev_ix;
        }
    }
    return unbroken_len;
}
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct BrotliHasherParams {
    /// type of hasher to use (default: type 6, but others have tradeoffs of speed/memory)
    pub type_: i32,
    /// number of the number of buckets to have in the hash table (defaults to quality - 1)
    pub bucket_bits: i32,
    /// number of potential matches to hold per bucket (hash collisions)
    pub block_bits: i32,
    /// number of bytes of a potential match to hash
    pub hash_len: i32,
    /// number of previous distance matches to check for future matches (defaults to 16)
    pub num_last_distances_to_check: i32,
    /// how much to weigh distance vs an extra byte of copy match when comparing possible copy srcs
    pub literal_byte_score: i32,
}

#[derive(Clone, Debug)]
pub struct BrotliEncoderParams {
    pub dist: BrotliDistanceParams,
    /// if this brotli file is generic, font or specifically text
    pub mode: BrotliEncoderMode,
    /// quality param between 0 and 11 (11 is smallest but takes longest to encode)
    pub quality: i32,
    pub q9_5: bool,
    /// log of how big the ring buffer should be for copying prior data
    pub lgwin: i32,
    /// log of how often metablocks should be serialized
    pub lgblock: i32,
    /// how big the source file is (or 0 if no hint is provided)
    pub size_hint: usize,
    // FIXME: this should be bool
    /// avoid serializing out priors for literal sections in the favor of decode speed
    pub disable_literal_context_modeling: i32,
    pub hasher: BrotliHasherParams,
    /// produce an IR of the compression file
    pub log_meta_block: bool,
    /// attempt to detect how many bytes before the current byte generates the best prediction of it
    /// * 0 = off (stride 1 always)
    /// * 1 = on per 16th of a file
    /// * 2 = on per block type switch
    pub stride_detection_quality: u8,
    /// if nonzero, will search for high entropy strings and log them differently to the IR
    pub high_entropy_detection_quality: u8,
    /// if nonzero it will search for the temporal locality and effectiveness of the priors
    /// for literals. The best adaptation and forgetfulness will be logged per metablock to the IR
    pub cdf_adaptation_detection: u8,
    /// whether to search for whether the previous byte or the context_map are better predictors on a per-context-map basis
    pub prior_bitmask_detection: u8,
    /// for prior bitmask detection: stride_low, stride_speed, cm_low, cm_speed
    pub literal_adaptation: [(u16, u16); 4],
    pub large_window: bool,
    /// avoid search for the best ndirect vs npostfix parameters for distance
    pub avoid_distance_prefix_search: bool,
    /// inserts an extra empty metadata block before the final empty metablock in
    /// catable/appendable mode so concatination tools can just remove the last byte
    pub byte_align: bool,
    /// do not emit a empty last block at end of data - if not appendable, this
    /// will also supress the stream header
    pub bare_stream: bool,
    /// construct brotli in such a way tha
```

---

# PADRAO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-0.61.3\src\Windows\Media\Playback\mod.rs
**SHA:** c1233d2ce20a0321
**Timestamp:** 2026-08-28T02:36:54.512986
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub CanStart: unsafe extern "system" fn(*mut core::ffi::c_void, *mut bool) -> windows_core::HRESULT,
- pub SetCanStart: unsafe extern "system" fn(*mut core::ffi::c_void, bool) -> windows_core::HRESULT,

### Ouro Bruto (primeiros 5000 chars)
```
#[repr(transparent)]
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub struct AutoLoadedDisplayPropertyKind(pub i32);
impl AutoLoadedDisplayPropertyKind {
    pub const None: Self = Self(0i32);
    pub const MusicOrVideo: Self = Self(1i32);
    pub const Music: Self = Self(2i32);
    pub const Video: Self = Self(3i32);
}
impl windows_core::TypeKind for AutoLoadedDisplayPropertyKind {
    type TypeKind = windows_core::CopyType;
}
impl windows_core::RuntimeType for AutoLoadedDisplayPropertyKind {
    const SIGNATURE: windows_core::imp::ConstBuffer = windows_core::imp::ConstBuffer::from_slice(b"enum(Windows.Media.Playback.AutoLoadedDisplayPropertyKind;i4)");
}
#[cfg(feature = "deprecated")]
pub struct BackgroundMediaPlayer;
#[cfg(feature = "deprecated")]
impl BackgroundMediaPlayer {
    pub fn Current() -> windows_core::Result<MediaPlayer> {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe {
            let mut result__ = core::mem::zeroed();
            (windows_core::Interface::vtable(this).Current)(windows_core::Interface::as_raw(this), &mut result__).and_then(|| windows_core::Type::from_abi(result__))
        })
    }
    pub fn MessageReceivedFromBackground<P0>(value: P0) -> windows_core::Result<i64>
    where
        P0: windows_core::Param<super::super::Foundation::EventHandler<MediaPlayerDataReceivedEventArgs>>,
    {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe {
            let mut result__ = core::mem::zeroed();
            (windows_core::Interface::vtable(this).MessageReceivedFromBackground)(windows_core::Interface::as_raw(this), value.param().abi(), &mut result__).map(|| result__)
        })
    }
    pub fn RemoveMessageReceivedFromBackground(token: i64) -> windows_core::Result<()> {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe { (windows_core::Interface::vtable(this).RemoveMessageReceivedFromBackground)(windows_core::Interface::as_raw(this), token).ok() })
    }
    pub fn MessageReceivedFromForeground<P0>(value: P0) -> windows_core::Result<i64>
    where
        P0: windows_core::Param<super::super::Foundation::EventHandler<MediaPlayerDataReceivedEventArgs>>,
    {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe {
            let mut result__ = core::mem::zeroed();
            (windows_core::Interface::vtable(this).MessageReceivedFromForeground)(windows_core::Interface::as_raw(this), value.param().abi(), &mut result__).map(|| result__)
        })
    }
    pub fn RemoveMessageReceivedFromForeground(token: i64) -> windows_core::Result<()> {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe { (windows_core::Interface::vtable(this).RemoveMessageReceivedFromForeground)(windows_core::Interface::as_raw(this), token).ok() })
    }
    #[cfg(feature = "Foundation_Collections")]
    pub fn SendMessageToBackground<P0>(value: P0) -> windows_core::Result<()>
    where
        P0: windows_core::Param<super::super::Foundation::Collections::ValueSet>,
    {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe { (windows_core::Interface::vtable(this).SendMessageToBackground)(windows_core::Interface::as_raw(this), value.param().abi()).ok() })
    }
    #[cfg(feature = "Foundation_Collections")]
    pub fn SendMessageToForeground<P0>(value: P0) -> windows_core::Result<()>
    where
        P0: windows_core::Param<super::super::Foundation::Collections::ValueSet>,
    {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe { (windows_core::Interface::vtable(this).SendMessageToForeground)(windows_core::Interface::as_raw(this), value.param().abi()).ok() })
    }
    pub fn IsMediaPlaying() -> windows_core::Result<bool> {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe {
            let mut result__ = core::mem::zeroed();
            (windows_core::Interface::vtable(this).IsMediaPlaying)(windows_core::Interface::as_raw(this), &mut result__).map(|| result__)
        })
    }
    pub fn Shutdown() -> windows_core::Result<()> {
        Self::IBackgroundMediaPlayerStatics(|this| unsafe { (windows_core::Interface::vtable(this).Shutdown)(windows_core::Interface::as_raw(this)).ok() })
    }
    fn IBackgroundMediaPlayerStatics<R, F: FnOnce(&IBackgroundMediaPlayerStatics) -> windows_core::Result<R>>(callback: F) -> windows_core::Result<R> {
        static SHARED: windows_core::imp::FactoryCache<BackgroundMediaPlayer, IBackgroundMediaPlayerStatics> = windows_core::imp::FactoryCache::new();
        SHARED.call(callback)
    }
}
#[cfg(feature = "deprecated")]
impl windows_core::RuntimeName for BackgroundMediaPlayer {
    const NAME: &'static str = "Windows.Media.Playback.BackgroundMediaPlayer";
}
#[repr(transparent)]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CurrentMediaPlaybackItemChangedEventArgs(windows_core::IUnknown);
windows_core::imp::interface_hierarchy!(CurrentMediaPlaybackItemChangedEventArgs, windows_core::IUnknown, windows_core::IInspectable);
impl CurrentMediaPlaybackItemChangedEventArgs {
    pub fn NewItem(&self) -> windows_co
```

---

# PADRAO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-0.61.3\src\Windows\Win32\AI\MachineLearning\DirectML\mod.rs
**SHA:** dc72b21a574679ad
**Timestamp:** 2026-08-28T02:36:56.531269
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub ValueStart: DML_SCALAR_UNION,

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "Win32_Graphics_Direct3D12")]
#[inline]
pub unsafe fn DMLCreateDevice<P0, T>(d3d12device: P0, flags: DML_CREATE_DEVICE_FLAGS, result__: *mut Option<T>) -> windows_core::Result<()>
where
    P0: windows_core::Param<super::super::super::Graphics::Direct3D12::ID3D12Device>,
    T: windows_core::Interface,
{
    windows_link::link!("directml.dll" "system" fn DMLCreateDevice(d3d12device : * mut core::ffi::c_void, flags : DML_CREATE_DEVICE_FLAGS, riid : *const windows_core::GUID, ppv : *mut *mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe { DMLCreateDevice(d3d12device.param().abi(), flags, &T::IID, result__ as *mut _ as *mut _).ok() }
}
#[cfg(feature = "Win32_Graphics_Direct3D12")]
#[inline]
pub unsafe fn DMLCreateDevice1<P0, T>(d3d12device: P0, flags: DML_CREATE_DEVICE_FLAGS, minimumfeaturelevel: DML_FEATURE_LEVEL, result__: *mut Option<T>) -> windows_core::Result<()>
where
    P0: windows_core::Param<super::super::super::Graphics::Direct3D12::ID3D12Device>,
    T: windows_core::Interface,
{
    windows_link::link!("directml.dll" "system" fn DMLCreateDevice1(d3d12device : * mut core::ffi::c_void, flags : DML_CREATE_DEVICE_FLAGS, minimumfeaturelevel : DML_FEATURE_LEVEL, riid : *const windows_core::GUID, ppv : *mut *mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe { DMLCreateDevice1(d3d12device.param().abi(), flags, minimumfeaturelevel, &T::IID, result__ as *mut _ as *mut _).ok() }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_CELU_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
    pub Alpha: f32,
}
impl Default for DML_ACTIVATION_CELU_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_ELU_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
    pub Alpha: f32,
}
impl Default for DML_ACTIVATION_ELU_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_HARDMAX_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
}
impl Default for DML_ACTIVATION_HARDMAX_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_HARD_SIGMOID_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
    pub Alpha: f32,
    pub Beta: f32,
}
impl Default for DML_ACTIVATION_HARD_SIGMOID_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_IDENTITY_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
}
impl Default for DML_ACTIVATION_IDENTITY_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_LEAKY_RELU_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
    pub Alpha: f32,
}
impl Default for DML_ACTIVATION_LEAKY_RELU_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_LINEAR_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
    pub Alpha: f32,
    pub Beta: f32,
}
impl Default for DML_ACTIVATION_LINEAR_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_LOG_SOFTMAX_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
}
impl Default for DML_ACTIVATION_LOG_SOFTMAX_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_PARAMETERIZED_RELU_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub SlopeTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
}
impl Default for DML_ACTIVATION_PARAMETERIZED_RELU_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DML_ACTIVATION_PARAMETRIC_SOFTPLUS_OPERATOR_DESC {
    pub InputTensor: *const DML_TENSOR_DESC,
    pub OutputTensor: *const DML_TENSOR_DESC,
    pub Alpha: f32,
    pub Beta: f32,
}
impl Default for DML_ACTIVATION_PARAMETRIC_SOFTPLUS_OPERATOR_DESC {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy
```
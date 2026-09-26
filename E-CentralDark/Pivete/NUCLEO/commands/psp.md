# COMANDO - psp.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\psp.rs
**SHA:** 5c4d5fa3a24dad41
**Timestamp:** 2026-08-28T02:34:33.976037
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- TransferStart = 0xea,
- pub mp3_stream_start: u32,
- pub const PSP_CTRL_START: i32 = 0x000008;

### Padroes
- pub init_pattern: u32,
- pub current_pattern: u32,

### Ouro Bruto (primeiros 5000 chars)
```
//! PSP C type definitions
//!
//! These type declarations are not enough, as they must be ultimately resolved
//! by the linker. Crates that use these definitions must, somewhere in the
//! crate graph, include a stub provider crate such as the `psp` crate.

use crate::prelude::*;

pub type intmax_t = i64;
pub type uintmax_t = u64;

pub type size_t = usize;
pub type ptrdiff_t = isize;
pub type intptr_t = isize;
pub type uintptr_t = usize;
pub type ssize_t = isize;

pub type SceKernelVTimerHandler = unsafe extern "C" fn(
    uid: SceUid,
    arg1: *mut SceKernelSysClock,
    arg2: *mut SceKernelSysClock,
    arg3: *mut c_void,
) -> u32;

pub type SceKernelVTimerHandlerWide =
    unsafe extern "C" fn(uid: SceUid, arg1: i64, arg2: i64, arg3: *mut c_void) -> u32;

pub type SceKernelThreadEventHandler =
    unsafe extern "C" fn(mask: i32, thid: SceUid, common: *mut c_void) -> i32;

pub type SceKernelAlarmHandler = unsafe extern "C" fn(common: *mut c_void) -> u32;

pub type SceKernelCallbackFunction =
    unsafe extern "C" fn(arg1: i32, arg2: i32, arg: *mut c_void) -> i32;

pub type SceKernelThreadEntry = unsafe extern "C" fn(args: usize, argp: *mut c_void) -> i32;

pub type PowerCallback = extern "C" fn(unknown: i32, power_info: i32);

pub type IoPermissions = i32;

pub type UmdCallback = fn(unknown: i32, event: i32) -> i32;

pub type SceMpegRingbufferCb =
    Option<unsafe extern "C" fn(data: *mut c_void, num_packets: i32, param: *mut c_void) -> i32>;

pub type GuCallback = Option<extern "C" fn(id: i32, arg: *mut c_void)>;
pub type GuSwapBuffersCallback =
    Option<extern "C" fn(display: *mut *mut c_void, render: *mut *mut c_void)>;

pub type SceNetAdhocctlHandler =
    Option<unsafe extern "C" fn(flag: i32, error: i32, unknown: *mut c_void)>;

pub type AdhocMatchingCallback = Option<
    unsafe extern "C" fn(
        matching_id: i32,
        event: i32,
        mac: *mut u8,
        opt_len: i32,
        opt_data: *mut c_void,
    ),
>;

pub type SceNetApctlHandler = Option<
    unsafe extern "C" fn(oldState: i32, newState: i32, event: i32, error: i32, pArg: *mut c_void),
>;

pub type HttpMallocFunction = Option<unsafe extern "C" fn(size: usize) -> *mut c_void>;
pub type HttpReallocFunction =
    Option<unsafe extern "C" fn(p: *mut c_void, size: usize) -> *mut c_void>;
pub type HttpFreeFunction = Option<unsafe extern "C" fn(p: *mut c_void)>;
pub type HttpPasswordCB = Option<
    unsafe extern "C" fn(
        request: i32,
        auth_type: HttpAuthType,
        realm: *const u8,
        username: *mut u8,
        password: *mut u8,
        need_entity: i32,
        entity_body: *mut *mut u8,
        entity_size: *mut usize,
        save: *mut i32,
    ) -> i32,
>;

pub type socklen_t = u32;

e! {
    #[repr(u32)]
    pub enum AudioFormat {
        Stereo = 0,
        Mono = 0x10,
    }

    #[repr(u32)]
    pub enum DisplayMode {
        Lcd = 0,
    }

    #[repr(u32)]
    pub enum DisplayPixelFormat {
        Psm5650 = 0,
        Psm5551 = 1,
        Psm4444 = 2,
        Psm8888 = 3,
    }

    #[repr(u32)]
    pub enum DisplaySetBufSync {
        Immediate = 0,
        NextFrame = 1,
    }

    #[repr(i32)]
    pub enum AudioOutputFrequency {
        Khz48 = 48000,
        Khz44_1 = 44100,
        Khz32 = 32000,
        Khz24 = 24000,
        Khz22_05 = 22050,
        Khz16 = 16000,
        Khz12 = 12000,
        Khz11_025 = 11025,
        Khz8 = 8000,
    }

    #[repr(i32)]
    pub enum AudioInputFrequency {
        Khz44_1 = 44100,
        Khz22_05 = 22050,
        Khz11_025 = 11025,
    }

    #[repr(u32)]
    pub enum CtrlMode {
        Digital = 0,
        Analog,
    }

    #[repr(i32)]
    pub enum GeMatrixType {
        Bone0 = 0,
        Bone1,
        Bone2,
        Bone3,
        Bone4,
        Bone5,
        Bone6,
        Bone7,
        World,
        View,
        Projection,
        TexGen,
    }

    #[repr(i32)]
    pub enum GeListState {
        Done = 0,
        Queued,
        DrawingDone,
        StallReached,
        CancelDone,
    }

    #[repr(u8)]
    pub enum GeCommand {
        Nop = 0,
        Vaddr = 0x1,
        Iaddr = 0x2,
        Prim = 0x4,
        Bezier = 0x5,
        Spline = 0x6,
        BoundingBox = 0x7,
        Jump = 0x8,
        BJump = 0x9,
        Call = 0xa,
        Ret = 0xb,
        End = 0xc,
        Signal = 0xe,
        Finish = 0xf,
        Base = 0x10,
        VertexType = 0x12,
        OffsetAddr = 0x13,
        Origin = 0x14,
        Region1 = 0x15,
        Region2 = 0x16,
        LightingEnable = 0x17,
        LightEnable0 = 0x18,
        LightEnable1 = 0x19,
        LightEnable2 = 0x1a,
        LightEnable3 = 0x1b,
        DepthClampEnable = 0x1c,
        CullFaceEnable = 0x1d,
        TextureMapEnable = 0x1e,
        FogEnable = 0x1f,
        DitherEnable = 0x20,
        AlphaBlendEnable = 0x21,
        AlphaTestEnable = 0x22,
        ZTestEnable = 0x23,
        StencilTestEnable = 0x24,
        AntiAliasEnable = 0x25,
        PatchCullEnable =
```
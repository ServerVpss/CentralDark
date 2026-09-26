# CONTRATO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-0.61.3\src\Windows\Win32\Data\HtmlHelp\mod.rs
**SHA:** 8f08795b94879d5f
**Timestamp:** 2026-08-28T02:36:56.618516
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub fExecute: windows_core::BOOL,

### Contratos
- pub const HHACT_CONTRACT: i32 = 6i32;
- pub const IDTB_CONTRACT: u32 = 201u32;

### Ouro Bruto (primeiros 5000 chars)
```
#[inline]
pub unsafe fn HtmlHelpA<P1>(hwndcaller: Option<super::super::Foundation::HWND>, pszfile: P1, ucommand: HTML_HELP_COMMAND, dwdata: usize) -> super::super::Foundation::HWND
where
    P1: windows_core::Param<windows_core::PCSTR>,
{
    windows_link::link!("hhctrl.ocx" "system" fn HtmlHelpA(hwndcaller : super::super::Foundation:: HWND, pszfile : windows_core::PCSTR, ucommand : u32, dwdata : usize) -> super::super::Foundation:: HWND);
    unsafe { HtmlHelpA(hwndcaller.unwrap_or(core::mem::zeroed()) as _, pszfile.param().abi(), ucommand.0 as _, dwdata) }
}
#[inline]
pub unsafe fn HtmlHelpW<P1>(hwndcaller: Option<super::super::Foundation::HWND>, pszfile: P1, ucommand: HTML_HELP_COMMAND, dwdata: usize) -> super::super::Foundation::HWND
where
    P1: windows_core::Param<windows_core::PCWSTR>,
{
    windows_link::link!("hhctrl.ocx" "system" fn HtmlHelpW(hwndcaller : super::super::Foundation:: HWND, pszfile : windows_core::PCWSTR, ucommand : u32, dwdata : usize) -> super::super::Foundation:: HWND);
    unsafe { HtmlHelpW(hwndcaller.unwrap_or(core::mem::zeroed()) as _, pszfile.param().abi(), ucommand.0 as _, dwdata) }
}
pub const CLSID_IITCmdInt: windows_core::GUID = windows_core::GUID::from_u128(0x4662daa2_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITDatabase: windows_core::GUID = windows_core::GUID::from_u128(0x66673452_8c23_11d0_a84e_00aa006c7d01);
pub const CLSID_IITDatabaseLocal: windows_core::GUID = windows_core::GUID::from_u128(0x4662daa9_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITGroupUpdate: windows_core::GUID = windows_core::GUID::from_u128(0x4662daa4_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITIndexBuild: windows_core::GUID = windows_core::GUID::from_u128(0x8fa0d5aa_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_IITPropList: windows_core::GUID = windows_core::GUID::from_u128(0x4662daae_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITResultSet: windows_core::GUID = windows_core::GUID::from_u128(0x4662daa7_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITSvMgr: windows_core::GUID = windows_core::GUID::from_u128(0x4662daa3_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITWWFilterBuild: windows_core::GUID = windows_core::GUID::from_u128(0x8fa0d5ab_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_IITWordWheel: windows_core::GUID = windows_core::GUID::from_u128(0xd73725c2_8c12_11d0_a84e_00aa006c7d01);
pub const CLSID_IITWordWheelLocal: windows_core::GUID = windows_core::GUID::from_u128(0x4662daa8_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITWordWheelUpdate: windows_core::GUID = windows_core::GUID::from_u128(0x4662daa5_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_ITEngStemmer: windows_core::GUID = windows_core::GUID::from_u128(0x8fa0d5a8_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_ITStdBreaker: windows_core::GUID = windows_core::GUID::from_u128(0x4662daaf_d393_11d0_9a56_00c04fb68bf7);
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct COLUMNSTATUS {
    pub cPropCount: i32,
    pub cPropsLoaded: i32,
}
#[repr(C)]
#[derive(Clone, Copy)]
pub struct CProperty {
    pub dwPropID: u32,
    pub cbData: u32,
    pub dwType: u32,
    pub Anonymous: CProperty_0,
    pub fPersist: windows_core::BOOL,
}
impl Default for CProperty {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy)]
pub union CProperty_0 {
    pub lpszwData: windows_core::PWSTR,
    pub lpvData: *mut core::ffi::c_void,
    pub dwValue: u32,
}
impl Default for CProperty_0 {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
pub const E_ALL_WILD: windows_core::HRESULT = windows_core::HRESULT(0x80001055_u32 as _);
pub const E_ALREADYINIT: windows_core::HRESULT = windows_core::HRESULT(0x80001083_u32 as _);
pub const E_ALREADYOPEN: windows_core::HRESULT = windows_core::HRESULT(0x80001013_u32 as _);
pub const E_ASSERT: windows_core::HRESULT = windows_core::HRESULT(0x80001006_u32 as _);
pub const E_BADBREAKER: windows_core::HRESULT = windows_core::HRESULT(0x80001053_u32 as _);
pub const E_BADFILE: windows_core::HRESULT = windows_core::HRESULT(0x80001003_u32 as _);
pub const E_BADFILTERSIZE: windows_core::HRESULT = windows_core::HRESULT(0x80001018_u32 as _);
pub const E_BADFORMAT: windows_core::HRESULT = windows_core::HRESULT(0x80001004_u32 as _);
pub const E_BADINDEXFLAGS: windows_core::HRESULT = windows_core::HRESULT(0x80001060_u32 as _);
pub const E_BADPARAM: windows_core::HRESULT = windows_core::HRESULT(0x80001011_u32 as _);
pub const E_BADRANGEOP: windows_core::HRESULT = windows_core::HRESULT(0x8000105D_u32 as _);
pub const E_BADVALUE: windows_core::HRESULT = windows_core::HRESULT(0x80001054_u32 as _);
pub const E_BADVERSION: windows_core::HRESULT = windows_core::HRESULT(0x80001002_u32 as _);
pub const E_CANTFINDDLL: windows_core::HRESULT = windows_core::HRESULT(0x8000100E_u32 as _);
pub const E_DISKFULL: windows_core::HRESULT = windows_core::HRESULT(0x80001038_u32 as _);
pub const E_DUPLICATE: windows_core::HRESULT = windows_core::HRE
```

---

# CONTRATO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-0.61.3\src\Windows\Win32\Media\Audio\mod.rs
**SHA:** 60ef7aed4becd472
**Timestamp:** 2026-08-28T02:37:03.296606
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const ACM_STREAMCONVERTF_START: u32 = 16u32;
- pub Start: unsafe extern "system" fn(*mut core::ffi::c_void) -> windows_core::HRESULT,
- Start: Start::<Identity, OFFSET>,
- pub Start: unsafe extern "system" fn(*mut core::ffi::c_void) -> windows_core::HRESULT,
- Start: Start::<Identity, OFFSET>,
- pub const SND_ALIAS_START: u32 = 0u32;
- pub const SPATIAL_AUDIO_STANDARD_COMMANDS_START: u32 = 200u32;

### Contratos
- pub const PKEY_AudioEndpointSettings_LaunchContract: super::super::Foundation::PROPERTYKEY = super::super::Foundation::PROPERTYKEY { fmtid: windows_core::GUID::from_u128(0x14242002_0320_4de4_9555_a7d8

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "Win32_Media_Audio_Apo")]
pub mod Apo;
#[cfg(feature = "Win32_Media_Audio_DirectMusic")]
pub mod DirectMusic;
#[cfg(feature = "Win32_Media_Audio_DirectSound")]
pub mod DirectSound;
#[cfg(feature = "Win32_Media_Audio_Endpoints")]
pub mod Endpoints;
#[cfg(feature = "Win32_Media_Audio_XAudio2")]
pub mod XAudio2;
#[cfg(all(feature = "Win32_System_Com_StructuredStorage", feature = "Win32_System_Variant"))]
#[inline]
pub unsafe fn ActivateAudioInterfaceAsync<P0, P3>(deviceinterfacepath: P0, riid: *const windows_core::GUID, activationparams: Option<*const super::super::System::Com::StructuredStorage::PROPVARIANT>, completionhandler: P3) -> windows_core::Result<IActivateAudioInterfaceAsyncOperation>
where
    P0: windows_core::Param<windows_core::PCWSTR>,
    P3: windows_core::Param<IActivateAudioInterfaceCompletionHandler>,
{
    windows_link::link!("mmdevapi.dll" "system" fn ActivateAudioInterfaceAsync(deviceinterfacepath : windows_core::PCWSTR, riid : *const windows_core::GUID, activationparams : *const super::super::System::Com::StructuredStorage:: PROPVARIANT, completionhandler : * mut core::ffi::c_void, activationoperation : *mut * mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe {
        let mut result__ = core::mem::zeroed();
        ActivateAudioInterfaceAsync(deviceinterfacepath.param().abi(), riid, activationparams.unwrap_or(core::mem::zeroed()) as _, completionhandler.param().abi(), &mut result__).and_then(|| windows_core::Type::from_abi(result__))
    }
}
#[inline]
pub unsafe fn CoRegisterMessageFilter<P0>(lpmessagefilter: P0, lplpmessagefilter: Option<*mut Option<IMessageFilter>>) -> windows_core::Result<()>
where
    P0: windows_core::Param<IMessageFilter>,
{
    windows_link::link!("ole32.dll" "system" fn CoRegisterMessageFilter(lpmessagefilter : * mut core::ffi::c_void, lplpmessagefilter : *mut * mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe { CoRegisterMessageFilter(lpmessagefilter.param().abi(), lplpmessagefilter.unwrap_or(core::mem::zeroed()) as _).ok() }
}
#[inline]
pub unsafe fn CreateCaptureAudioStateMonitor() -> windows_core::Result<IAudioStateMonitor> {
    windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitor(audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe {
        let mut result__ = core::mem::zeroed();
        CreateCaptureAudioStateMonitor(&mut result__).and_then(|| windows_core::Type::from_abi(result__))
    }
}
#[inline]
pub unsafe fn CreateCaptureAudioStateMonitorForCategory(category: AUDIO_STREAM_CATEGORY) -> windows_core::Result<IAudioStateMonitor> {
    windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategory(category : AUDIO_STREAM_CATEGORY, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe {
        let mut result__ = core::mem::zeroed();
        CreateCaptureAudioStateMonitorForCategory(category, &mut result__).and_then(|| windows_core::Type::from_abi(result__))
    }
}
#[inline]
pub unsafe fn CreateCaptureAudioStateMonitorForCategoryAndDeviceId<P1>(category: AUDIO_STREAM_CATEGORY, deviceid: P1) -> windows_core::Result<IAudioStateMonitor>
where
    P1: windows_core::Param<windows_core::PCWSTR>,
{
    windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategoryAndDeviceId(category : AUDIO_STREAM_CATEGORY, deviceid : windows_core::PCWSTR, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe {
        let mut result__ = core::mem::zeroed();
        CreateCaptureAudioStateMonitorForCategoryAndDeviceId(category, deviceid.param().abi(), &mut result__).and_then(|| windows_core::Type::from_abi(result__))
    }
}
#[inline]
pub unsafe fn CreateCaptureAudioStateMonitorForCategoryAndDeviceRole(category: AUDIO_STREAM_CATEGORY, role: ERole) -> windows_core::Result<IAudioStateMonitor> {
    windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategoryAndDeviceRole(category : AUDIO_STREAM_CATEGORY, role : ERole, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe {
        let mut result__ = core::mem::zeroed();
        CreateCaptureAudioStateMonitorForCategoryAndDeviceRole(category, role, &mut result__).and_then(|| windows_core::Type::from_abi(result__))
    }
}
#[inline]
pub unsafe fn CreateRenderAudioStateMonitor() -> windows_core::Result<IAudioStateMonitor> {
    windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitor(audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_core::HRESULT);
    unsafe {
        let mut result__ = core::mem::zeroed();
        CreateRenderAudioStateMonitor(&mut result__).and_then(|| windows_core::Type::from_abi(result__))
    }
}
#[inline]
pub unsafe fn CreateRenderAudioStateMonitorForCategory(category: AUDIO_STREAM_CATEGORY) -> windows_core::Resu
```

---

# CONTRATO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-sys-0.59.0\src\Windows\Win32\Data\HtmlHelp\mod.rs
**SHA:** cfa8b73d1979e474
**Timestamp:** 2026-08-28T02:37:13.301481
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub fExecute: super::super::Foundation::BOOL,

### Contratos
- pub const HHACT_CONTRACT: i32 = 6i32;
- pub const IDTB_CONTRACT: u32 = 201u32;

### Ouro Bruto (primeiros 5000 chars)
```
windows_targets::link!("hhctrl.ocx" "system" fn HtmlHelpA(hwndcaller : super::super::Foundation:: HWND, pszfile : windows_sys::core::PCSTR, ucommand : u32, dwdata : usize) -> super::super::Foundation:: HWND);
windows_targets::link!("hhctrl.ocx" "system" fn HtmlHelpW(hwndcaller : super::super::Foundation:: HWND, pszfile : windows_sys::core::PCWSTR, ucommand : u32, dwdata : usize) -> super::super::Foundation:: HWND);
pub const CLSID_IITCmdInt: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa2_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITDatabase: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x66673452_8c23_11d0_a84e_00aa006c7d01);
pub const CLSID_IITDatabaseLocal: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa9_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITGroupUpdate: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa4_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITIndexBuild: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x8fa0d5aa_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_IITPropList: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daae_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITResultSet: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa7_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITSvMgr: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa3_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITWWFilterBuild: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x8fa0d5ab_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_IITWordWheel: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0xd73725c2_8c12_11d0_a84e_00aa006c7d01);
pub const CLSID_IITWordWheelLocal: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa8_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITWordWheelUpdate: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa5_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_ITEngStemmer: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x8fa0d5a8_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_ITStdBreaker: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daaf_d393_11d0_9a56_00c04fb68bf7);
pub const E_ALL_WILD: windows_sys::core::HRESULT = 0x80001055_u32 as _;
pub const E_ALREADYINIT: windows_sys::core::HRESULT = 0x80001083_u32 as _;
pub const E_ALREADYOPEN: windows_sys::core::HRESULT = 0x80001013_u32 as _;
pub const E_ASSERT: windows_sys::core::HRESULT = 0x80001006_u32 as _;
pub const E_BADBREAKER: windows_sys::core::HRESULT = 0x80001053_u32 as _;
pub const E_BADFILE: windows_sys::core::HRESULT = 0x80001003_u32 as _;
pub const E_BADFILTERSIZE: windows_sys::core::HRESULT = 0x80001018_u32 as _;
pub const E_BADFORMAT: windows_sys::core::HRESULT = 0x80001004_u32 as _;
pub const E_BADINDEXFLAGS: windows_sys::core::HRESULT = 0x80001060_u32 as _;
pub const E_BADPARAM: windows_sys::core::HRESULT = 0x80001011_u32 as _;
pub const E_BADRANGEOP: windows_sys::core::HRESULT = 0x8000105D_u32 as _;
pub const E_BADVALUE: windows_sys::core::HRESULT = 0x80001054_u32 as _;
pub const E_BADVERSION: windows_sys::core::HRESULT = 0x80001002_u32 as _;
pub const E_CANTFINDDLL: windows_sys::core::HRESULT = 0x8000100E_u32 as _;
pub const E_DISKFULL: windows_sys::core::HRESULT = 0x80001038_u32 as _;
pub const E_DUPLICATE: windows_sys::core::HRESULT = 0x80001001_u32 as _;
pub const E_EXPECTEDTERM: windows_sys::core::HRESULT = 0x80001057_u32 as _;
pub const E_FILECLOSE: windows_sys::core::HRESULT = 0x80001031_u32 as _;
pub const E_FILECREATE: windows_sys::core::HRESULT = 0x80001030_u32 as _;
pub const E_FILEDELETE: windows_sys::core::HRESULT = 0x80001035_u32 as _;
pub const E_FILEINVALID: windows_sys::core::HRESULT = 0x80001036_u32 as _;
pub const E_FILENOTFOUND: windows_sys::core::HRESULT = 0x80001037_u32 as _;
pub const E_FILEREAD: windows_sys::core::HRESULT = 0x80001032_u32 as _;
pub const E_FILESEEK: windows_sys::core::HRESULT = 0x80001033_u32 as _;
pub const E_FILEWRITE: windows_sys::core::HRESULT = 0x80001034_u32 as _;
pub const E_GETLASTERROR: windows_sys::core::HRESULT = 0x80001010_u32 as _;
pub const E_GROUPIDTOOBIG: windows_sys::core::HRESULT = 0x8000100A_u32 as _;
pub const E_INTERRUPT: windows_sys::core::HRESULT = 0x80001007_u32 as _;
pub const E_INVALIDSTATE: windows_sys::core::HRESULT = 0x80001012_u32 as _;
pub const E_MISSINGPROP: windows_sys::core::HRESULT = 0x80001080_u32 as _;
pub const E_MISSLPAREN: windows_sys::core::HRESULT = 0x80001058_u32 as _;
pub const E_MISSQUOTE: windows_sys::core::HRESULT = 0x8000105A_u32 as _;
pub const E_MISSRPAREN: windows_sys::core::HRESULT = 0x80001059_u32 as _;
pub const E_NAMETOOLONG: windows_sys::core::HRESULT = 0x80001020_u32 as _;
pub const E_NOHANDLE: windows_sys::core::HRESULT = 0x8000100F_u32 as _;
pub const E_NOKEYPROP: windows_sys::core::HRESULT = 0x80001087_u32 as _;
pub const E_NOMERGEDDATA: windows_sys::core::HRESULT = 0x8000
```

---

# CONTRATO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-sys-0.59.0\src\Windows\Win32\Media\Audio\mod.rs
**SHA:** fcada96b64b432bd
**Timestamp:** 2026-08-28T02:37:18.156183
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const ACM_STREAMCONVERTF_START: u32 = 16u32;
- pub const SND_ALIAS_START: u32 = 0u32;
- pub const SPATIAL_AUDIO_STANDARD_COMMANDS_START: u32 = 200u32;

### Contratos
- pub const PKEY_AudioEndpointSettings_LaunchContract: super::super::UI::Shell::PropertiesSystem::PROPERTYKEY = super::super::UI::Shell::PropertiesSystem::PROPERTYKEY { fmtid: windows_sys::core::GUID::f

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(all(feature = "Win32_System_Com_StructuredStorage", feature = "Win32_System_Variant"))]
windows_targets::link!("mmdevapi.dll" "system" fn ActivateAudioInterfaceAsync(deviceinterfacepath : windows_sys::core::PCWSTR, riid : *const windows_sys::core::GUID, activationparams : *const super::super::System::Com::StructuredStorage:: PROPVARIANT, completionhandler : * mut core::ffi::c_void, activationoperation : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("ole32.dll" "system" fn CoRegisterMessageFilter(lpmessagefilter : * mut core::ffi::c_void, lplpmessagefilter : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitor(audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategory(category : AUDIO_STREAM_CATEGORY, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategoryAndDeviceId(category : AUDIO_STREAM_CATEGORY, deviceid : windows_sys::core::PCWSTR, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategoryAndDeviceRole(category : AUDIO_STREAM_CATEGORY, role : ERole, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitor(audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitorForCategory(category : AUDIO_STREAM_CATEGORY, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitorForCategoryAndDeviceId(category : AUDIO_STREAM_CATEGORY, deviceid : windows_sys::core::PCWSTR, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitorForCategoryAndDeviceRole(category : AUDIO_STREAM_CATEGORY, role : ERole, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_targets::link!("winmm.dll" "system" fn PlaySoundA(pszsound : windows_sys::core::PCSTR, hmod : super::super::Foundation:: HMODULE, fdwsound : SND_FLAGS) -> super::super::Foundation:: BOOL);
windows_targets::link!("winmm.dll" "system" fn PlaySoundW(pszsound : windows_sys::core::PCWSTR, hmod : super::super::Foundation:: HMODULE, fdwsound : SND_FLAGS) -> super::super::Foundation:: BOOL);
windows_targets::link!("msacm32.dll" "system" fn acmDriverAddA(phadid : *mut HACMDRIVERID, hinstmodule : super::super::Foundation:: HINSTANCE, lparam : super::super::Foundation:: LPARAM, dwpriority : u32, fdwadd : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmDriverAddW(phadid : *mut HACMDRIVERID, hinstmodule : super::super::Foundation:: HINSTANCE, lparam : super::super::Foundation:: LPARAM, dwpriority : u32, fdwadd : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmDriverClose(had : HACMDRIVER, fdwclose : u32) -> u32);
#[cfg(feature = "Win32_UI_WindowsAndMessaging")]
windows_targets::link!("msacm32.dll" "system" fn acmDriverDetailsA(hadid : HACMDRIVERID, padd : *mut ACMDRIVERDETAILSA, fdwdetails : u32) -> u32);
#[cfg(feature = "Win32_UI_WindowsAndMessaging")]
windows_targets::link!("msacm32.dll" "system" fn acmDriverDetailsW(hadid : HACMDRIVERID, padd : *mut ACMDRIVERDETAILSW, fdwdetails : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmDriverEnum(fncallback : ACMDRIVERENUMCB, dwinstance : usize, fdwenum : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmDriverID(hao : HACMOBJ, phadid : *mut HACMDRIVERID, fdwdriverid : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmDriverMessage(had : HACMDRIVER, umsg : u32, lparam1 : super::super::Foundation:: LPARAM, lparam2 : super::super::Foundation:: LPARAM) -> super::super::Foundation:: LRESULT);
windows_targets::link!("msacm32.dll" "system" fn acmDriverOpen(phad : *mut HACMDRIVER, hadid : HACMDRIVERID, fdwopen : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmDriverPriority(hadid : HACMDRIVERID, dwpriority : u32, fdwpriority : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmDriverRemove(hadid : HACMDRIVERID, fdwremove : u32) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmFilterChooseA(pafltrc : *mut ACMFILTERCHOOSEA) -> u32);
windows_targets::link!("msacm32.dll" "system" fn acmFilterChooseW(pafltrc : *mut ACMFILTERCHOOSEW) -> u32);
windows_targets::link
```

---

# CONTRATO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-sys-0.61.2\src\Windows\Win32\Data\HtmlHelp\mod.rs
**SHA:** f6ecf342144c5ba9
**Timestamp:** 2026-08-28T02:37:27.731046
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub fExecute: windows_sys::core::BOOL,

### Contratos
- pub const HHACT_CONTRACT: i32 = 6i32;
- pub const IDTB_CONTRACT: u32 = 201u32;

### Ouro Bruto (primeiros 5000 chars)
```
windows_link::link!("hhctrl.ocx" "system" fn HtmlHelpA(hwndcaller : super::super::Foundation:: HWND, pszfile : windows_sys::core::PCSTR, ucommand : u32, dwdata : usize) -> super::super::Foundation:: HWND);
windows_link::link!("hhctrl.ocx" "system" fn HtmlHelpW(hwndcaller : super::super::Foundation:: HWND, pszfile : windows_sys::core::PCWSTR, ucommand : u32, dwdata : usize) -> super::super::Foundation:: HWND);
pub const CLSID_IITCmdInt: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa2_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITDatabase: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x66673452_8c23_11d0_a84e_00aa006c7d01);
pub const CLSID_IITDatabaseLocal: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa9_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITGroupUpdate: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa4_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITIndexBuild: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x8fa0d5aa_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_IITPropList: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daae_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITResultSet: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa7_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITSvMgr: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa3_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITWWFilterBuild: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x8fa0d5ab_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_IITWordWheel: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0xd73725c2_8c12_11d0_a84e_00aa006c7d01);
pub const CLSID_IITWordWheelLocal: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa8_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_IITWordWheelUpdate: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daa5_d393_11d0_9a56_00c04fb68bf7);
pub const CLSID_ITEngStemmer: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x8fa0d5a8_dedf_11d0_9a61_00c04fb68bf7);
pub const CLSID_ITStdBreaker: windows_sys::core::GUID = windows_sys::core::GUID::from_u128(0x4662daaf_d393_11d0_9a56_00c04fb68bf7);
#[repr(C)]
#[derive(Clone, Copy, Default)]
pub struct COLUMNSTATUS {
    pub cPropCount: i32,
    pub cPropsLoaded: i32,
}
#[repr(C)]
#[derive(Clone, Copy)]
pub struct CProperty {
    pub dwPropID: u32,
    pub cbData: u32,
    pub dwType: u32,
    pub Anonymous: CProperty_0,
    pub fPersist: windows_sys::core::BOOL,
}
impl Default for CProperty {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
#[repr(C)]
#[derive(Clone, Copy)]
pub union CProperty_0 {
    pub lpszwData: windows_sys::core::PWSTR,
    pub lpvData: *mut core::ffi::c_void,
    pub dwValue: u32,
}
impl Default for CProperty_0 {
    fn default() -> Self {
        unsafe { core::mem::zeroed() }
    }
}
pub const E_ALL_WILD: windows_sys::core::HRESULT = 0x80001055_u32 as _;
pub const E_ALREADYINIT: windows_sys::core::HRESULT = 0x80001083_u32 as _;
pub const E_ALREADYOPEN: windows_sys::core::HRESULT = 0x80001013_u32 as _;
pub const E_ASSERT: windows_sys::core::HRESULT = 0x80001006_u32 as _;
pub const E_BADBREAKER: windows_sys::core::HRESULT = 0x80001053_u32 as _;
pub const E_BADFILE: windows_sys::core::HRESULT = 0x80001003_u32 as _;
pub const E_BADFILTERSIZE: windows_sys::core::HRESULT = 0x80001018_u32 as _;
pub const E_BADFORMAT: windows_sys::core::HRESULT = 0x80001004_u32 as _;
pub const E_BADINDEXFLAGS: windows_sys::core::HRESULT = 0x80001060_u32 as _;
pub const E_BADPARAM: windows_sys::core::HRESULT = 0x80001011_u32 as _;
pub const E_BADRANGEOP: windows_sys::core::HRESULT = 0x8000105D_u32 as _;
pub const E_BADVALUE: windows_sys::core::HRESULT = 0x80001054_u32 as _;
pub const E_BADVERSION: windows_sys::core::HRESULT = 0x80001002_u32 as _;
pub const E_CANTFINDDLL: windows_sys::core::HRESULT = 0x8000100E_u32 as _;
pub const E_DISKFULL: windows_sys::core::HRESULT = 0x80001038_u32 as _;
pub const E_DUPLICATE: windows_sys::core::HRESULT = 0x80001001_u32 as _;
pub const E_EXPECTEDTERM: windows_sys::core::HRESULT = 0x80001057_u32 as _;
pub const E_FILECLOSE: windows_sys::core::HRESULT = 0x80001031_u32 as _;
pub const E_FILECREATE: windows_sys::core::HRESULT = 0x80001030_u32 as _;
pub const E_FILEDELETE: windows_sys::core::HRESULT = 0x80001035_u32 as _;
pub const E_FILEINVALID: windows_sys::core::HRESULT = 0x80001036_u32 as _;
pub const E_FILENOTFOUND: windows_sys::core::HRESULT = 0x80001037_u32 as _;
pub const E_FILEREAD: windows_sys::core::HRESULT = 0x80001032_u32 as _;
pub const E_FILESEEK: windows_sys::core::HRESULT = 0x80001033_u32 as _;
pub const E_FILEWRITE: windows_sys::core::HRESULT = 0x80001034_u32 as _;
pub const E_GETLASTERROR: windows_sys::core::HRESULT = 0x80001010_u32 as _;
pub const E_GROUPIDTOOBIG: windows_sys::core::HRESULT = 0x8000100A_u32 as _;
pub const E_INTERRUPT: windows_sys
```

---

# CONTRATO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-sys-0.61.2\src\Windows\Win32\Media\Audio\mod.rs
**SHA:** 73a52845a0e993cf
**Timestamp:** 2026-08-28T02:37:31.009268
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const ACM_STREAMCONVERTF_START: u32 = 16u32;
- pub const SND_ALIAS_START: u32 = 0u32;
- pub const SPATIAL_AUDIO_STANDARD_COMMANDS_START: u32 = 200u32;

### Contratos
- pub const PKEY_AudioEndpointSettings_LaunchContract: super::super::Foundation::PROPERTYKEY = super::super::Foundation::PROPERTYKEY { fmtid: windows_sys::core::GUID::from_u128(0x14242002_0320_4de4_9555

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(all(feature = "Win32_System_Com_StructuredStorage", feature = "Win32_System_Variant"))]
windows_link::link!("mmdevapi.dll" "system" fn ActivateAudioInterfaceAsync(deviceinterfacepath : windows_sys::core::PCWSTR, riid : *const windows_sys::core::GUID, activationparams : *const super::super::System::Com::StructuredStorage:: PROPVARIANT, completionhandler : * mut core::ffi::c_void, activationoperation : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("ole32.dll" "system" fn CoRegisterMessageFilter(lpmessagefilter : * mut core::ffi::c_void, lplpmessagefilter : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitor(audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategory(category : AUDIO_STREAM_CATEGORY, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategoryAndDeviceId(category : AUDIO_STREAM_CATEGORY, deviceid : windows_sys::core::PCWSTR, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateCaptureAudioStateMonitorForCategoryAndDeviceRole(category : AUDIO_STREAM_CATEGORY, role : ERole, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitor(audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitorForCategory(category : AUDIO_STREAM_CATEGORY, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitorForCategoryAndDeviceId(category : AUDIO_STREAM_CATEGORY, deviceid : windows_sys::core::PCWSTR, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("windows.media.mediacontrol.dll" "system" fn CreateRenderAudioStateMonitorForCategoryAndDeviceRole(category : AUDIO_STREAM_CATEGORY, role : ERole, audiostatemonitor : *mut * mut core::ffi::c_void) -> windows_sys::core::HRESULT);
windows_link::link!("winmm.dll" "system" fn PlaySoundA(pszsound : windows_sys::core::PCSTR, hmod : super::super::Foundation:: HMODULE, fdwsound : SND_FLAGS) -> windows_sys::core::BOOL);
windows_link::link!("winmm.dll" "system" fn PlaySoundW(pszsound : windows_sys::core::PCWSTR, hmod : super::super::Foundation:: HMODULE, fdwsound : SND_FLAGS) -> windows_sys::core::BOOL);
windows_link::link!("msacm32.dll" "system" fn acmDriverAddA(phadid : *mut HACMDRIVERID, hinstmodule : super::super::Foundation:: HINSTANCE, lparam : super::super::Foundation:: LPARAM, dwpriority : u32, fdwadd : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmDriverAddW(phadid : *mut HACMDRIVERID, hinstmodule : super::super::Foundation:: HINSTANCE, lparam : super::super::Foundation:: LPARAM, dwpriority : u32, fdwadd : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmDriverClose(had : HACMDRIVER, fdwclose : u32) -> u32);
#[cfg(feature = "Win32_UI_WindowsAndMessaging")]
windows_link::link!("msacm32.dll" "system" fn acmDriverDetailsA(hadid : HACMDRIVERID, padd : *mut ACMDRIVERDETAILSA, fdwdetails : u32) -> u32);
#[cfg(feature = "Win32_UI_WindowsAndMessaging")]
windows_link::link!("msacm32.dll" "system" fn acmDriverDetailsW(hadid : HACMDRIVERID, padd : *mut ACMDRIVERDETAILSW, fdwdetails : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmDriverEnum(fncallback : ACMDRIVERENUMCB, dwinstance : usize, fdwenum : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmDriverID(hao : HACMOBJ, phadid : *mut HACMDRIVERID, fdwdriverid : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmDriverMessage(had : HACMDRIVER, umsg : u32, lparam1 : super::super::Foundation:: LPARAM, lparam2 : super::super::Foundation:: LPARAM) -> super::super::Foundation:: LRESULT);
windows_link::link!("msacm32.dll" "system" fn acmDriverOpen(phad : *mut HACMDRIVER, hadid : HACMDRIVERID, fdwopen : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmDriverPriority(hadid : HACMDRIVERID, dwpriority : u32, fdwpriority : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmDriverRemove(hadid : HACMDRIVERID, fdwremove : u32) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmFilterChooseA(pafltrc : *mut ACMFILTERCHOOSEA) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmFilterChooseW(pafltrc : *mut ACMFILTERCHOOSEW) -> u32);
windows_link::link!("msacm32.dll" "system" fn acmFilterDetailsA(had : HACMDRIVER, pafd : *mut ACMFILTERDETAILSA,
```
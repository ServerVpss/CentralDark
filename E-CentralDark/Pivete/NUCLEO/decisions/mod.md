# DECISAO - mod.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-sys-0.61.2\src\Windows\Win32\NetworkManagement\QoS\mod.rs
**SHA:** 7332f2ba4917be3d
**Timestamp:** 2026-08-28T02:37:33.277126
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SIPAEV_TXT_HASH_START: u32 = 1026u32;

### Padroes
- pub Pattern: *mut core::ffi::c_void,

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "Win32_Networking_WinSock")]
windows_link::link!("qwave.dll" "system" fn QOSAddSocketToFlow(qoshandle : super::super::Foundation:: HANDLE, socket : super::super::Networking::WinSock:: SOCKET, destaddr : *const super::super::Networking::WinSock:: SOCKADDR, traffictype : QOS_TRAFFIC_TYPE, flags : u32, flowid : *mut u32) -> windows_sys::core::BOOL);
#[cfg(feature = "Win32_System_IO")]
windows_link::link!("qwave.dll" "system" fn QOSCancel(qoshandle : super::super::Foundation:: HANDLE, overlapped : *const super::super::System::IO:: OVERLAPPED) -> windows_sys::core::BOOL);
windows_link::link!("qwave.dll" "system" fn QOSCloseHandle(qoshandle : super::super::Foundation:: HANDLE) -> windows_sys::core::BOOL);
windows_link::link!("qwave.dll" "system" fn QOSCreateHandle(version : *const QOS_VERSION, qoshandle : *mut super::super::Foundation:: HANDLE) -> windows_sys::core::BOOL);
windows_link::link!("qwave.dll" "system" fn QOSEnumerateFlows(qoshandle : super::super::Foundation:: HANDLE, size : *mut u32, buffer : *mut core::ffi::c_void) -> windows_sys::core::BOOL);
#[cfg(feature = "Win32_System_IO")]
windows_link::link!("qwave.dll" "system" fn QOSNotifyFlow(qoshandle : super::super::Foundation:: HANDLE, flowid : u32, operation : QOS_NOTIFY_FLOW, size : *mut u32, buffer : *mut core::ffi::c_void, flags : u32, overlapped : *mut super::super::System::IO:: OVERLAPPED) -> windows_sys::core::BOOL);
#[cfg(feature = "Win32_System_IO")]
windows_link::link!("qwave.dll" "system" fn QOSQueryFlow(qoshandle : super::super::Foundation:: HANDLE, flowid : u32, operation : QOS_QUERY_FLOW, size : *mut u32, buffer : *mut core::ffi::c_void, flags : u32, overlapped : *mut super::super::System::IO:: OVERLAPPED) -> windows_sys::core::BOOL);
#[cfg(feature = "Win32_Networking_WinSock")]
windows_link::link!("qwave.dll" "system" fn QOSRemoveSocketFromFlow(qoshandle : super::super::Foundation:: HANDLE, socket : super::super::Networking::WinSock:: SOCKET, flowid : u32, flags : u32) -> windows_sys::core::BOOL);
#[cfg(feature = "Win32_System_IO")]
windows_link::link!("qwave.dll" "system" fn QOSSetFlow(qoshandle : super::super::Foundation:: HANDLE, flowid : u32, operation : QOS_SET_FLOW, size : u32, buffer : *const core::ffi::c_void, flags : u32, overlapped : *mut super::super::System::IO:: OVERLAPPED) -> windows_sys::core::BOOL);
#[cfg(feature = "Win32_Networking_WinSock")]
windows_link::link!("qwave.dll" "system" fn QOSStartTrackingClient(qoshandle : super::super::Foundation:: HANDLE, destaddr : *const super::super::Networking::WinSock:: SOCKADDR, flags : u32) -> windows_sys::core::BOOL);
#[cfg(feature = "Win32_Networking_WinSock")]
windows_link::link!("qwave.dll" "system" fn QOSStopTrackingClient(qoshandle : super::super::Foundation:: HANDLE, destaddr : *const super::super::Networking::WinSock:: SOCKADDR, flags : u32) -> windows_sys::core::BOOL);
windows_link::link!("traffic.dll" "system" fn TcAddFilter(flowhandle : super::super::Foundation:: HANDLE, pgenericfilter : *const TC_GEN_FILTER, pfilterhandle : *mut super::super::Foundation:: HANDLE) -> u32);
#[cfg(feature = "Win32_Networking_WinSock")]
windows_link::link!("traffic.dll" "system" fn TcAddFlow(ifchandle : super::super::Foundation:: HANDLE, clflowctx : super::super::Foundation:: HANDLE, flags : u32, pgenericflow : *const TC_GEN_FLOW, pflowhandle : *mut super::super::Foundation:: HANDLE) -> u32);
windows_link::link!("traffic.dll" "system" fn TcCloseInterface(ifchandle : super::super::Foundation:: HANDLE) -> u32);
windows_link::link!("traffic.dll" "system" fn TcDeleteFilter(filterhandle : super::super::Foundation:: HANDLE) -> u32);
windows_link::link!("traffic.dll" "system" fn TcDeleteFlow(flowhandle : super::super::Foundation:: HANDLE) -> u32);
windows_link::link!("traffic.dll" "system" fn TcDeregisterClient(clienthandle : super::super::Foundation:: HANDLE) -> u32);
#[cfg(feature = "Win32_Networking_WinSock")]
windows_link::link!("traffic.dll" "system" fn TcEnumerateFlows(ifchandle : super::super::Foundation:: HANDLE, penumhandle : *mut super::super::Foundation:: HANDLE, pflowcount : *mut u32, pbufsize : *mut u32, buffer : *mut ENUMERATION_BUFFER) -> u32);
#[cfg(feature = "Win32_NetworkManagement_Ndis")]
windows_link::link!("traffic.dll" "system" fn TcEnumerateInterfaces(clienthandle : super::super::Foundation:: HANDLE, pbuffersize : *mut u32, interfacebuffer : *mut TC_IFC_DESCRIPTOR) -> u32);
windows_link::link!("traffic.dll" "system" fn TcGetFlowNameA(flowhandle : super::super::Foundation:: HANDLE, strsize : u32, pflowname : windows_sys::core::PSTR) -> u32);
windows_link::link!("traffic.dll" "system" fn TcGetFlowNameW(flowhandle : super::super::Foundation:: HANDLE, strsize : u32, pflowname : windows_sys::core::PWSTR) -> u32);
#[cfg(feature = "Win32_Networking_WinSock")]
windows_link::link!("traffic.dll" "system" fn TcModifyFlow(flowhandle : super::super::Foundation:: HANDLE, pgenericflow : *const TC_GEN_FLOW) -> u32);
windows_link::link!("traffic.dll" "system" fn TcOpenInterfac
```
---
name: video-sdk/windows
description: "Zoom Video SDK for Windows - C++ integration for video sessions, raw audio/video capture, screen sharing, recording, and real-time communication"
---

# Zoom Video SDK (Windows)

Windows platform support for Zoom Video SDK. Build custom video applications with C++ or C#/.NET integration.

For complete documentation, see **[SKILL.md](SKILL.md)**

## Quick Links

- **[Windows SDK Guide](SKILL.md)** - Complete Windows development guide
- **[API Reference](references/windows-reference.md)** - Complete API documentation
- **Official Docs**: https://developers.zoom.us/docs/video-sdk/windows/

## Features

- Full video session control
- Raw audio/video capture (PCM, YUV I420)
- Raw media injection (virtual audio/video)
- Cloud recording & live streaming
- Multi-platform support (x64, x86, ARM64)

## UI Framework Integration

| Framework | Approach | Guide |
|-----------|----------|-------|
| **Win32** | Direct SDK + Canvas API | [Win32 Guide](examples/dotnet-winforms/guide.md#option-1-win32-native-c---direct-sdk) |
| **WinForms** | C++/CLI wrapper + Raw Data | [WinForms Guide](examples/dotnet-winforms/guide.md#option-2-winforms-c--ccli-wrapper) |
| **WPF** | C++/CLI wrapper + BitmapSource | [WPF Guide](examples/dotnet-winforms/guide.md#option-3-wpf-c--ccli-wrapper) |

## C++/CLI Wrapper Patterns (Any Native Library → .NET)

Complete 8-pattern guide for wrapping native C++ libraries:
- [Full Guide](examples/dotnet-winforms/guide.md#ccli-wrapper-patterns-for-net-integration)
- Patterns: void*, gcroot<T^>, Finalizer, Strings, Arrays, Threading, LockBits

## Sample Repositories

- **GitHub**: https://github.com/zoom/videosdk-windows-rawdata-sample
- **Local Samples**:
  - `C:\tempsdk\Zoom_VideoSDK_Windows_RawDataDemos\` - C++ demos
  - `C:\tempsdk\videosdk-windows-dotnet-desktop-framework-quickstart\` - C# demos
  - `C:\tempsdk\sdksamples\zoom-video-sdk-windows-2.4.12\` - Official SDK samples


---

# OUTRO - windows.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\default-browser@5.5.1@@@1\windows.js
**SHA:** afd6e3bef2b56206
**Timestamp:** 2026-08-28T02:24:07.545875
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Fix the casing of bundle identifiers in the next major version.

### Ouro Bruto (primeiros 5000 chars)
```
import process from 'node:process';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';

const execFileAsync = promisify(execFile);

// TODO: Fix the casing of bundle identifiers in the next major version.

// Windows doesn't have browser IDs in the same way macOS/Linux does so we give fake
// ones that look real and match the macOS/Linux versions for cross-platform apps.
const windowsBrowserProgIds = {
	MSEdgeHTM: {name: 'Edge', id: 'com.microsoft.edge'}, // The missing `L` is correct.
	MSEdgeBHTML: {name: 'Edge Beta', id: 'com.microsoft.edge.beta'},
	MSEdgeDHTML: {name: 'Edge Dev', id: 'com.microsoft.edge.dev'},
	AppXq0fevzme2pys62n3e0fbqa7peapykr8v: {name: 'Edge', id: 'com.microsoft.edge.old'},
	ChromeHTML: {name: 'Chrome', id: 'com.google.chrome'},
	ChromeBHTML: {name: 'Chrome Beta', id: 'com.google.chrome.beta'},
	ChromeDHTML: {name: 'Chrome Dev', id: 'com.google.chrome.dev'},
	ChromiumHTM: {name: 'Chromium', id: 'org.chromium.Chromium'},
	BraveHTML: {name: 'Brave', id: 'com.brave.Browser'},
	BraveBHTML: {name: 'Brave Beta', id: 'com.brave.Browser.beta'},
	BraveDHTML: {name: 'Brave Dev', id: 'com.brave.Browser.dev'},
	BraveSSHTM: {name: 'Brave Nightly', id: 'com.brave.Browser.nightly'},
	FirefoxURL: {name: 'Firefox', id: 'org.mozilla.firefox'},
	OperaStable: {name: 'Opera', id: 'com.operasoftware.Opera'},
	VivaldiHTM: {name: 'Vivaldi', id: 'com.vivaldi.Vivaldi'},
	'IE.HTTP': {name: 'Internet Explorer', id: 'com.microsoft.ie'},
};

export const _windowsBrowserProgIdMap = new Map(Object.entries(windowsBrowserProgIds));

export class UnknownBrowserError extends Error {}

export default async function defaultBrowser(_execFileAsync = execFileAsync) {
	const regPath = `${process.env.SYSTEMROOT ?? process.env.windir ?? 'C:\\Windows'}\\System32\\reg.exe`;
	const {stdout} = await _execFileAsync(regPath, [
		'QUERY',
		' HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice',
		'/v',
		'ProgId',
	]);

	const match = /ProgId\s*REG_SZ\s*(?<id>\S+)/.exec(stdout);
	if (!match) {
		throw new UnknownBrowserError(`Cannot find Windows browser in stdout: ${JSON.stringify(stdout)}`);
	}

	const {id} = match.groups;

	// Windows can append a hash suffix to ProgIds using a dot or hyphen
	// (e.g., `ChromeHTML.ABC123`, `FirefoxURL-6F193CCC56814779`).
	// Try exact match first, then try without the suffix.
	const dotIndex = id.lastIndexOf('.');
	const hyphenIndex = id.lastIndexOf('-');
	const baseIdByDot = dotIndex === -1 ? undefined : id.slice(0, dotIndex);
	const baseIdByHyphen = hyphenIndex === -1 ? undefined : id.slice(0, hyphenIndex);

	return windowsBrowserProgIds[id] ?? windowsBrowserProgIds[baseIdByDot] ?? windowsBrowserProgIds[baseIdByHyphen] ?? {name: id, id};
}

```

---

# OUTRO - windows.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\socket2-0.6.5\src\sys\windows.rs
**SHA:** ea941638399a4e3f
**Timestamp:** 2026-08-28T02:35:44.396648
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();

### Gaps
- // TODO: use clamp from std lib, stable since 1.50.

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2015 The Rust Project Developers.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// https://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or https://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use std::cmp::min;
use std::io::{self, IoSlice};
use std::marker::PhantomData;
use std::mem::{self, size_of, MaybeUninit};
use std::net::{self, Ipv4Addr, Ipv6Addr, Shutdown};
use std::os::windows::io::{
    AsRawSocket, AsSocket, BorrowedSocket, FromRawSocket, IntoRawSocket, OwnedSocket,
    RawSocket as StdRawSocket,
};
use std::path::Path;
use std::sync::Once;
use std::time::{Duration, Instant};
use std::{process, ptr, slice};

use windows_sys::Win32::Foundation::{SetHandleInformation, HANDLE, HANDLE_FLAG_INHERIT};
use windows_sys::Win32::Networking::WinSock::{
    self, tcp_keepalive, FIONBIO, IN6_ADDR, IN6_ADDR_0, INVALID_SOCKET, IN_ADDR, IN_ADDR_0,
    POLLERR, POLLHUP, POLLRDNORM, POLLWRNORM, SD_BOTH, SD_RECEIVE, SD_SEND, SIO_KEEPALIVE_VALS,
    SOCKET_ERROR, WSABUF, WSAEMSGSIZE, WSAESHUTDOWN, WSAPOLLFD, WSAPROTOCOL_INFOW,
    WSA_FLAG_NO_HANDLE_INHERIT, WSA_FLAG_OVERLAPPED, WSA_FLAG_REGISTERED_IO,
};

#[cfg(feature = "all")]
use windows_sys::Win32::Networking::WinSock::{
    SIO_TCP_SET_ACK_FREQUENCY, TCP_ACK_FREQUENCY_PARAMETERS,
};

#[cfg(feature = "all")]
use windows_sys::Win32::Networking::WinSock::{
    IP6T_SO_ORIGINAL_DST, SOL_IP, SO_ORIGINAL_DST, SO_PROTOCOL_INFOW,
};
use windows_sys::Win32::System::Threading::INFINITE;

use crate::{MsgHdr, RecvFlags, SockAddr, SockAddrStorage, TcpKeepalive, Type};

#[allow(non_camel_case_types)]
pub(crate) type c_int = std::ffi::c_int;

/// Fake MSG_TRUNC flag for the [`RecvFlags`] struct.
///
/// The flag is enabled when a `WSARecv[From]` call returns `WSAEMSGSIZE`. The
/// value of the flag is defined by us.
pub(crate) const MSG_TRUNC: c_int = 0x01;

// Used in `Domain`.
pub(crate) const AF_INET: c_int = windows_sys::Win32::Networking::WinSock::AF_INET as c_int;
pub(crate) const AF_INET6: c_int = windows_sys::Win32::Networking::WinSock::AF_INET6 as c_int;
pub(crate) const AF_UNIX: c_int = windows_sys::Win32::Networking::WinSock::AF_UNIX as c_int;
pub(crate) const AF_UNSPEC: c_int = windows_sys::Win32::Networking::WinSock::AF_UNSPEC as c_int;
// Used in `Type`.
pub(crate) const SOCK_STREAM: c_int = windows_sys::Win32::Networking::WinSock::SOCK_STREAM as c_int;
pub(crate) const SOCK_DGRAM: c_int = windows_sys::Win32::Networking::WinSock::SOCK_DGRAM as c_int;
pub(crate) const SOCK_RAW: c_int = windows_sys::Win32::Networking::WinSock::SOCK_RAW as c_int;
const SOCK_RDM: c_int = windows_sys::Win32::Networking::WinSock::SOCK_RDM as c_int;
pub(crate) const SOCK_SEQPACKET: c_int =
    windows_sys::Win32::Networking::WinSock::SOCK_SEQPACKET as c_int;
// Used in `Protocol`.
pub(crate) use windows_sys::Win32::Networking::WinSock::{
    IPPROTO_ICMP, IPPROTO_ICMPV6, IPPROTO_TCP, IPPROTO_UDP,
};

#[cfg(feature = "all")]
pub(crate) use windows_sys::Win32::Networking::WinSock::TCP_KEEPCNT;
// Used in `SockAddr`.
pub(crate) use windows_sys::Win32::Networking::WinSock::{
    SOCKADDR as sockaddr, SOCKADDR_IN as sockaddr_in, SOCKADDR_IN6 as sockaddr_in6,
    SOCKADDR_STORAGE as sockaddr_storage,
};
#[allow(non_camel_case_types)]
pub(crate) type sa_family_t = windows_sys::Win32::Networking::WinSock::ADDRESS_FAMILY;
#[allow(non_camel_case_types)]
pub(crate) type socklen_t = windows_sys::Win32::Networking::WinSock::socklen_t;
// Used in `Socket`.
#[cfg(feature = "all")]
pub(crate) use windows_sys::Win32::Networking::WinSock::IP_HDRINCL;
pub(crate) use windows_sys::Win32::Networking::WinSock::{
    IPPROTO_IPV6, IPV6_ADD_MEMBERSHIP, IPV6_DROP_MEMBERSHIP, IPV6_MREQ as Ipv6Mreq,
    IPV6_MULTICAST_HOPS, IPV6_MULTICAST_IF, IPV6_MULTICAST_LOOP, IPV6_RECVTCLASS,
    IPV6_UNICAST_HOPS, IPV6_V6ONLY, IP_ADD_MEMBERSHIP, IP_ADD_SOURCE_MEMBERSHIP,
    IP_DROP_MEMBERSHIP, IP_DROP_SOURCE_MEMBERSHIP, IP_MREQ as IpMreq,
    IP_MREQ_SOURCE as IpMreqSource, IP_MULTICAST_IF, IP_MULTICAST_LOOP, IP_MULTICAST_TTL,
    IP_RECVTOS, IP_TOS, IP_TTL, LINGER as linger, MSG_OOB, MSG_PEEK, SO_BROADCAST, SO_ERROR,
    SO_KEEPALIVE, SO_LINGER, SO_OOBINLINE, SO_RCVBUF, SO_RCVTIMEO, SO_REUSEADDR, SO_SNDBUF,
    SO_SNDTIMEO, SO_TYPE, TCP_NODELAY,
};
pub(crate) const IPPROTO_IP: c_int = windows_sys::Win32::Networking::WinSock::IPPROTO_IP as c_int;
pub(crate) const SOL_SOCKET: c_int = windows_sys::Win32::Networking::WinSock::SOL_SOCKET as c_int;

// This is so we can special case MaybeUninit::assume_init for Bool.
// See Bool for why.
pub(crate) trait GetsockoptOutput: Sized {
    unsafe fn assume_init(uninit: MaybeUninit<Self>, size: c_int) -> Self {
        debug_assert_eq!(size as usize, size_of::<Self>());
        uninit.assume_init()
    }
}

impl GetsockoptOutput for i32 {}
impl GetsockoptOutput for u32 {}
impl GetsockoptOutput for IN_ADDR {}
impl GetsockoptOutp
```
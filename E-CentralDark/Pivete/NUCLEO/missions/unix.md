# MISSAO - unix.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\socket2-0.6.5\src\sys\unix.rs
**SHA:** 5193fd8c91103f8c
**Timestamp:** 2026-08-28T02:35:44.363930
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();

### Gaps
- /* TODO: add these optional bit OR-ed flags:
- // TODO: add FreeBSD.
- // TODO: replace with `MaybeUninit::uninit_array` once stable.
- // TODO: use `MaybeUninit::slice_assume_init_ref` once stable.

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
#[cfg(not(target_os = "wasi"))]
use std::ffi::OsStr;
#[cfg(not(any(target_os = "redox", target_os = "wasi", target_os = "horizon")))]
use std::io::IoSlice;
use std::marker::PhantomData;
use std::mem::{self, size_of, MaybeUninit};
use std::net::Shutdown;
use std::net::{Ipv4Addr, Ipv6Addr};
#[cfg(all(
    feature = "all",
    any(
        target_os = "ios",
        target_os = "visionos",
        target_os = "macos",
        target_os = "tvos",
        target_os = "watchos",
        target_os = "illumos",
        target_os = "solaris",
        target_os = "linux",
        target_os = "android",
    )
))]
use std::num::NonZeroU32;
#[cfg(all(
    feature = "all",
    any(
        target_os = "aix",
        target_os = "android",
        target_os = "freebsd",
        target_os = "ios",
        target_os = "visionos",
        target_os = "linux",
        target_os = "macos",
        target_os = "tvos",
        target_os = "watchos",
    )
))]
use std::num::NonZeroUsize;
use std::os::fd::{AsFd, AsRawFd, BorrowedFd, FromRawFd, IntoRawFd, OwnedFd, RawFd};
#[cfg(not(target_os = "wasi"))]
use std::os::unix::ffi::OsStrExt;
#[cfg(all(feature = "all", unix))]
use std::os::unix::net::{UnixDatagram, UnixListener, UnixStream};
#[cfg(not(target_os = "wasi"))]
use std::path::Path;
use std::ptr;
use std::time::{Duration, Instant};
use std::{io, slice};

#[cfg(not(any(
    target_os = "ios",
    target_os = "visionos",
    target_os = "macos",
    target_os = "tvos",
    target_os = "watchos",
    target_os = "cygwin",
)))]
use libc::ssize_t;
use libc::{in6_addr, in_addr};

#[cfg(not(target_os = "wasi"))]
use crate::SockAddrStorage;
use crate::{Domain, Protocol, SockAddr, TcpKeepalive, Type};
#[cfg(not(any(target_os = "redox", target_os = "wasi", target_os = "horizon")))]
use crate::{MsgHdr, MsgHdrMut, RecvFlags};

pub(crate) use std::ffi::c_int;

// Used in `Domain`.
#[cfg(not(target_os = "wasi"))]
pub(crate) use libc::AF_UNIX;
pub(crate) use libc::{AF_INET, AF_INET6};
// Used in `Type`.
#[cfg(all(feature = "all", target_os = "linux"))]
pub(crate) use libc::SOCK_DCCP;
#[cfg(all(
    feature = "all",
    not(any(
        target_os = "redox",
        target_os = "espidf",
        target_os = "wasi",
        target_os = "horizon"
    ))
))]
pub(crate) use libc::SOCK_RAW;
#[cfg(all(
    feature = "all",
    not(any(target_os = "espidf", target_os = "wasi", target_os = "horizon"))
))]
pub(crate) use libc::SOCK_SEQPACKET;
pub(crate) use libc::{SOCK_DGRAM, SOCK_STREAM};
// Used in `Protocol`.
#[cfg(all(feature = "all", target_os = "linux"))]
pub(crate) use libc::IPPROTO_DCCP;
#[cfg(target_os = "linux")]
pub(crate) use libc::IPPROTO_MPTCP;
#[cfg(all(feature = "all", any(target_os = "freebsd", target_os = "linux")))]
pub(crate) use libc::IPPROTO_SCTP;
#[cfg(all(
    feature = "all",
    any(
        target_os = "android",
        target_os = "freebsd",
        target_os = "fuchsia",
        target_os = "linux",
    )
))]
pub(crate) use libc::IPPROTO_UDPLITE;
#[cfg(not(target_os = "wasi"))]
pub(crate) use libc::{IPPROTO_ICMP, IPPROTO_ICMPV6};
pub(crate) use libc::{IPPROTO_TCP, IPPROTO_UDP};
// Used in `SockAddr`.
#[cfg(all(feature = "all", any(target_os = "freebsd", target_os = "openbsd")))]
pub(crate) use libc::IPPROTO_DIVERT;
pub(crate) use libc::{
    sa_family_t, sockaddr, sockaddr_in, sockaddr_in6, sockaddr_storage, socklen_t,
};
// Used in `RecvFlags`.
#[cfg(not(any(
    target_os = "redox",
    target_os = "espidf",
    target_os = "wasi",
    target_os = "horizon"
)))]
pub(crate) use libc::MSG_TRUNC;
#[cfg(not(any(target_os = "redox", target_os = "wasi")))]
pub(crate) use libc::SO_OOBINLINE;
// Used in `Socket`.
#[cfg(not(any(target_os = "nto", target_os = "nuttx")))]
pub(crate) use libc::ipv6_mreq as Ipv6Mreq;
#[cfg(all(feature = "all", target_os = "linux"))]
pub(crate) use libc::IPV6_HDRINCL;
#[cfg(all(
    feature = "all",
    not(any(
        target_os = "dragonfly",
        target_os = "fuchsia",
        target_os = "hurd",
        target_os = "illumos",
        target_os = "netbsd",
        target_os = "openbsd",
        target_os = "redox",
        target_os = "solaris",
        target_os = "haiku",
        target_os = "espidf",
        target_os = "vita",
        target_os = "wasi",
        target_os = "cygwin",
        target_os = "horizon"
    ))
))]
pub(crate) use libc::IPV6_RECVHOPLIMIT;
#[cfg(not(any(
    target_os = "dragonfly",
    target_os = "fuchsia",
    target_os = "hurd",
    target_os = "illumos",
    target_os = "netbsd",
    target_os = "openbsd",
    target_os = "redox",
    target_os = "solaris",
    target_os = "haiku",
    target_os = 
```
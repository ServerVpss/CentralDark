# OUTRO - udp.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\mio-1.2.2\src\net\udp.rs
**SHA:** 865baa73b3f4d863
**Timestamp:** 2026-08-28T02:34:50.164604
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this

### Ouro Bruto (primeiros 5000 chars)
```
//! Primitives for working with UDP.
//!
//! The types provided in this module are non-blocking by default and are
//! designed to be portable across all supported Mio platforms. As long as the
//! [portability guidelines] are followed, the behavior should be identical no
//! matter the target platform.
//!
//! [portability guidelines]: ../struct.Poll.html#portability

use std::net::{Ipv4Addr, Ipv6Addr, SocketAddr};
#[cfg(any(unix, target_os = "wasi"))]
use std::os::fd::{AsFd, AsRawFd, BorrowedFd, FromRawFd, IntoRawFd, OwnedFd, RawFd};
// TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this
// can use `std::os::fd` and be merged with the above.
#[cfg(target_os = "hermit")]
use std::os::hermit::io::{AsFd, AsRawFd, BorrowedFd, FromRawFd, IntoRawFd, OwnedFd, RawFd};
#[cfg(windows)]
use std::os::windows::io::{
    AsRawSocket, AsSocket, BorrowedSocket, FromRawSocket, IntoRawSocket, OwnedSocket, RawSocket,
};
use std::{fmt, io, net};

use crate::io_source::IoSource;
use crate::{event, sys, Interest, Registry, Token};

/// A User Datagram Protocol socket.
///
/// This is an implementation of a bound UDP socket. This supports both IPv4 and
/// IPv6 addresses, and there is no corresponding notion of a server because UDP
/// is a datagram protocol.
///
/// # Examples
///
#[cfg_attr(feature = "os-poll", doc = "```")]
#[cfg_attr(not(feature = "os-poll"), doc = "```ignore")]
/// # use std::error::Error;
/// #
/// # fn main() -> Result<(), Box<dyn Error>> {
/// # // Temporarily disabled on WASI pending https://github.com/WebAssembly/wasi-libc/pull/740:
/// # if cfg!(target_os = "wasi") { return Ok(()) }
/// // An Echo program:
/// // SENDER -> sends a message.
/// // ECHOER -> listens and prints the message received.
///
/// use mio::net::UdpSocket;
/// use mio::{Events, Interest, Poll, Token};
/// use std::time::Duration;
///
/// const SENDER: Token = Token(0);
/// const ECHOER: Token = Token(1);
///
/// // This operation will fail if the address is in use, so we select different ports for each
/// // socket.
/// let mut sender_socket = UdpSocket::bind("127.0.0.1:0".parse()?)?;
/// let mut echoer_socket = UdpSocket::bind("127.0.0.1:0".parse()?)?;
///
/// // If we do not use connect here, SENDER and ECHOER would need to call send_to and recv_from
/// // respectively.
/// sender_socket.connect(echoer_socket.local_addr()?)?;
///
/// // We need a Poll to check if SENDER is ready to be written into, and if ECHOER is ready to be
/// // read from.
/// let mut poll = Poll::new()?;
///
/// // We register our sockets here so that we can check if they are ready to be written/read.
/// poll.registry().register(&mut sender_socket, SENDER, Interest::WRITABLE)?;
/// poll.registry().register(&mut echoer_socket, ECHOER, Interest::READABLE)?;
///
/// let msg_to_send = [9; 9];
/// let mut buffer = [0; 9];
///
/// let mut events = Events::with_capacity(128);
/// loop {
///     poll.poll(&mut events, Some(Duration::from_millis(100)))?;
///     for event in events.iter() {
///         match event.token() {
///             // Our SENDER is ready to be written into.
///             SENDER => {
///                 let bytes_sent = sender_socket.send(&msg_to_send)?;
///                 assert_eq!(bytes_sent, 9);
///                 println!("sent {:?} -> {:?} bytes", msg_to_send, bytes_sent);
///             },
///             // Our ECHOER is ready to be read from.
///             ECHOER => {
///                 let num_recv = echoer_socket.recv(&mut buffer)?;
///                 println!("echo {:?} -> {:?}", buffer, num_recv);
///                 buffer = [0; 9];
///                 # _ = buffer; // Silence unused assignment warning.
///                 # return Ok(());
///             }
///             _ => unreachable!()
///         }
///     }
/// }
/// # }
/// ```
pub struct UdpSocket {
    inner: IoSource<net::UdpSocket>,
}

impl UdpSocket {
    /// Creates a UDP socket from the given address.
    ///
    /// # Examples
    ///
    #[cfg_attr(feature = "os-poll", doc = "```")]
    #[cfg_attr(not(feature = "os-poll"), doc = "```ignore")]
    /// # use std::error::Error;
    /// #
    /// # fn main() -> Result<(), Box<dyn Error>> {
    /// use mio::net::UdpSocket;
    ///
    /// // We must bind it to an open address.
    /// let socket = match UdpSocket::bind("127.0.0.1:0".parse()?) {
    ///     Ok(new_socket) => new_socket,
    ///     Err(fail) => {
    ///         // We panic! here, but you could try to bind it again on another address.
    ///         panic!("Failed to bind socket. {:?}", fail);
    ///     }
    /// };
    ///
    /// // Our socket was created, but we should not use it before checking it's readiness.
    /// #    drop(socket); // Silence unused variable warning.
    /// #    Ok(())
    /// # }
    /// ```
    pub fn bind(addr: SocketAddr) -> io::Result<UdpSocket> {
        sys::udp::bind(addr).map(UdpSocket::from_std)
    }

    /// Creates a new `UdpSocket` from a standard `net::UdpSocket`.
  
```

---

# OUTRO - udp.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\mio-1.2.2\src\sys\unix\udp.rs
**SHA:** 2d9c704b059fdd0b
**Timestamp:** 2026-08-28T02:34:50.670115
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this

### Ouro Bruto (primeiros 5000 chars)
```
use std::io;
use std::mem;
use std::net::{self, SocketAddr};
#[cfg(not(target_os = "hermit"))]
use std::os::fd::{AsRawFd, FromRawFd};
// TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this
// can use `std::os::fd` and be merged with the above.
#[cfg(target_os = "hermit")]
use std::os::hermit::io::{AsRawFd, FromRawFd};

use crate::sys::unix::net::{new_ip_socket, socket_addr};

pub fn bind(addr: SocketAddr) -> io::Result<net::UdpSocket> {
    let fd = new_ip_socket(addr, libc::SOCK_DGRAM)?;
    let socket = unsafe { net::UdpSocket::from_raw_fd(fd) };

    let (raw_addr, raw_addr_length) = socket_addr(&addr);
    syscall!(bind(fd, raw_addr.as_ptr(), raw_addr_length))?;

    Ok(socket)
}

pub(crate) fn only_v6(socket: &net::UdpSocket) -> io::Result<bool> {
    let mut optval: libc::c_int = 0;
    let mut optlen = mem::size_of::<libc::c_int>() as libc::socklen_t;

    syscall!(getsockopt(
        socket.as_raw_fd(),
        libc::IPPROTO_IPV6,
        libc::IPV6_V6ONLY,
        &mut optval as *mut _ as *mut _,
        &mut optlen,
    ))?;

    Ok(optval != 0)
}

```
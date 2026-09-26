# OUTRO - stream.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\mio-1.2.2\src\net\tcp\stream.rs
**SHA:** 127757a47bbfc770
**Timestamp:** 2026-08-28T02:34:50.231704
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this

### Ouro Bruto (primeiros 5000 chars)
```
use std::fmt;
use std::io::{self, IoSlice, IoSliceMut, Read, Write};
use std::net::{self, Shutdown, SocketAddr};
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

use crate::io_source::IoSource;
#[cfg(not(all(target_os = "wasi", target_env = "p1")))]
use crate::sys::tcp::{connect, new_for_addr};
use crate::{event, Interest, Registry, Token};

/// A non-blocking TCP stream between a local socket and a remote socket.
///
/// The socket will be closed when the value is dropped.
///
/// # Examples
///
#[cfg_attr(feature = "os-poll", doc = "```")]
#[cfg_attr(not(feature = "os-poll"), doc = "```ignore")]
/// # use std::net::{TcpListener, SocketAddr};
/// # use std::error::Error;
/// #
/// # fn main() -> Result<(), Box<dyn Error>> {
/// let address: SocketAddr = "127.0.0.1:0".parse()?;
/// let listener = TcpListener::bind(address)?;
/// use mio::{Events, Interest, Poll, Token};
/// use mio::net::TcpStream;
/// use std::time::Duration;
///
/// let mut stream = TcpStream::connect(listener.local_addr()?)?;
///
/// let mut poll = Poll::new()?;
/// let mut events = Events::with_capacity(128);
///
/// // Register the socket with `Poll`
/// poll.registry().register(&mut stream, Token(0), Interest::WRITABLE)?;
///
/// poll.poll(&mut events, Some(Duration::from_millis(100)))?;
///
/// // The socket might be ready at this point
/// #     Ok(())
/// # }
/// ```
pub struct TcpStream {
    inner: IoSource<net::TcpStream>,
}

impl TcpStream {
    /// Create a new TCP stream and issue a non-blocking connect to the
    /// specified address.
    ///
    /// # Notes
    ///
    /// The returned `TcpStream` may not be connected (and thus usable), unlike
    /// the API found in `std::net::TcpStream`. Because Mio issues a
    /// *non-blocking* connect it will not block the thread and instead return
    /// an unconnected `TcpStream`.
    ///
    /// Ensuring the returned stream is connected is surprisingly complex when
    /// considering cross-platform support. Doing this properly should follow
    /// the steps below, an example implementation can be found
    /// [here](https://github.com/Thomasdezeeuw/heph/blob/0c4f1ab3eaf08bea1d65776528bfd6114c9f8374/src/net/tcp/stream.rs#L560-L622).
    ///
    ///  1. Call `TcpStream::connect`
    ///  2. Register the returned stream with at least [write interest].
    ///  3. Wait for a (writable) event.
    ///  4. Check `TcpStream::take_error`. If it returns an error, then
    ///     something went wrong. If it returns `Ok(None)`, then proceed to
    ///     step 5.
    ///  5. Check `TcpStream::peer_addr`. If it returns `libc::EINPROGRESS` or
    ///     `ErrorKind::NotConnected` it means the stream is not yet connected,
    ///     go back to step 3. If it returns an address it means the stream is
    ///     connected, go to step 6. If another error is returned something
    ///     went wrong.
    ///  6. Now the stream can be used.
    ///
    /// This may return a `WouldBlock` in which case the socket connection
    /// cannot be completed immediately, it usually means there are insufficient
    /// entries in the routing cache.
    ///
    /// [write interest]: Interest::WRITABLE
    #[cfg(not(all(target_os = "wasi", target_env = "p1")))]
    pub fn connect(addr: SocketAddr) -> io::Result<TcpStream> {
        let socket = new_for_addr(addr)?;
        #[cfg(any(unix, target_os = "hermit", target_os = "wasi"))]
        let stream = unsafe { TcpStream::from_raw_fd(socket) };
        #[cfg(windows)]
        let stream = unsafe { TcpStream::from_raw_socket(socket as _) };
        connect(&stream.inner, addr)?;
        Ok(stream)
    }

    /// Creates a new `TcpStream` from a standard `net::TcpStream`.
    ///
    /// This function is intended to be used to wrap a TCP stream from the
    /// standard library in the Mio equivalent. The conversion assumes nothing
    /// about the underlying stream; it is left up to the user to set it in
    /// non-blocking mode.
    ///
    /// # Note
    ///
    /// The TCP stream here will not have `connect` called on it, so it
    /// should already be connected via some other means (be it manually, or
    /// the standard library).
    pub fn from_std(stream: net::TcpStream) -> TcpStream {
        TcpStream {
            inner: IoSource::new(stream),
        }
    }

    /// Returns the socket address of the remote peer of this TCP connection.
    pub fn peer_addr(&self) -> io::Result<SocketAddr> {
        self.inner.peer_addr()
    }

    /// Returns the socket address of the local hal
```

---

# OUTRO - stream.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\binary\bits\stream.rs
**SHA:** a62a033a5c36b681
**Timestamp:** 2026-08-28T02:37:40.904169
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- _token_start: &Self::Checkpoint,
- _err_start: &Self::Checkpoint,
- fn offset_from(&self, start: &Self) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
use core::num::NonZeroUsize;

use crate::error::Needed;
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::stream::Recover;
use crate::stream::{Checkpoint, Offset, Stream, StreamIsPartial};

/// Bit-level stream state over a byte stream.
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Bits<I>(pub I, pub usize);

impl<I> Stream for Bits<I>
where
    I: Stream<Token = u8> + Clone,
{
    type Token = bool;
    type Slice = (I::Slice, usize, usize);

    type IterOffsets = BitOffsets<I>;
    type Checkpoint = Checkpoint<Bits<I::Checkpoint>, Self>;

    #[inline(always)]
    fn iter_offsets(&self) -> Self::IterOffsets {
        BitOffsets {
            i: self.clone(),
            o: 0,
        }
    }

    #[inline(always)]
    fn eof_offset(&self) -> usize {
        let offset = self.0.eof_offset() * 8;
        if offset == 0 {
            0
        } else {
            offset - self.1
        }
    }

    #[inline(always)]
    fn next_token(&mut self) -> Option<Self::Token> {
        next_bit(self)
    }

    #[inline(always)]
    fn peek_token(&self) -> Option<Self::Token> {
        peek_bit(self)
    }

    #[inline(always)]
    fn offset_for<P>(&self, predicate: P) -> Option<usize>
    where
        P: Fn(Self::Token) -> bool,
    {
        self.iter_offsets()
            .find_map(|(o, b)| predicate(b).then_some(o))
    }

    #[inline(always)]
    fn offset_at(&self, tokens: usize) -> Result<usize, Needed> {
        if let Some(needed) = tokens
            .checked_sub(self.eof_offset())
            .and_then(NonZeroUsize::new)
        {
            Err(Needed::Size(needed))
        } else {
            Ok(tokens)
        }
    }

    #[inline(always)]
    fn next_slice(&mut self, offset: usize) -> Self::Slice {
        let byte_offset = (offset + self.1) / 8;
        let end_offset = (offset + self.1) % 8;
        let s = self.0.next_slice(byte_offset);
        let start_offset = self.1;
        self.1 = end_offset;
        (s, start_offset, end_offset)
    }

    #[inline(always)]
    fn peek_slice(&self, offset: usize) -> Self::Slice {
        let byte_offset = (offset + self.1) / 8;
        let end_offset = (offset + self.1) % 8;
        let s = self.0.peek_slice(byte_offset);
        let start_offset = self.1;
        (s, start_offset, end_offset)
    }

    #[inline(always)]
    fn checkpoint(&self) -> Self::Checkpoint {
        Checkpoint::<_, Self>::new(Bits(self.0.checkpoint(), self.1))
    }

    #[inline(always)]
    fn reset(&mut self, checkpoint: &Self::Checkpoint) {
        self.0.reset(&checkpoint.inner.0);
        self.1 = checkpoint.inner.1;
    }

    fn trace(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(f, "{self:#?}")
    }
}

/// Iterator for [bit][crate::binary::bits] stream ([`Bits`])
pub struct BitOffsets<I> {
    i: Bits<I>,
    o: usize,
}

impl<I> Iterator for BitOffsets<I>
where
    I: Stream<Token = u8> + Clone,
{
    type Item = (usize, bool);

    fn next(&mut self) -> Option<Self::Item> {
        let b = next_bit(&mut self.i)?;
        let o = self.o;
        self.o += 1;
        Some((o, b))
    }
}

fn next_bit<I>(i: &mut Bits<I>) -> Option<bool>
where
    I: Stream<Token = u8> + Clone,
{
    if i.eof_offset() == 0 {
        return None;
    }

    let offset = i.1;
    let mut next_i = i.0.clone();
    let byte = next_i.next_token()?;
    let bit = (byte >> offset) & 0x1 == 0x1;

    let next_offset = offset + 1;
    if next_offset == 8 {
        i.0 = next_i;
        i.1 = 0;
    } else {
        i.1 = next_offset;
    }
    Some(bit)
}

fn peek_bit<I>(i: &Bits<I>) -> Option<bool>
where
    I: Stream<Token = u8> + Clone,
{
    if i.eof_offset() == 0 {
        return None;
    }

    let offset = i.1;
    let mut next_i = i.0.clone();
    let byte = next_i.next_token()?;
    Some((byte >> offset) & 0x1 == 0x1)
}

#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
impl<I, E> Recover<E> for Bits<I>
where
    I: Recover<E>,
    I: Stream<Token = u8> + Clone,
{
    #[inline(always)]
    fn record_err(
        &mut self,
        _token_start: &Self::Checkpoint,
        _err_start: &Self::Checkpoint,
        err: E,
    ) -> Result<(), E> {
        Err(err)
    }

    #[inline(always)]
    fn is_recovery_supported() -> bool {
        false
    }
}

impl<I> StreamIsPartial for Bits<I>
where
    I: StreamIsPartial,
{
    type PartialState = I::PartialState;

    #[inline]
    fn complete(&mut self) -> Self::PartialState {
        self.0.complete()
    }

    #[inline]
    fn restore_partial(&mut self, state: Self::PartialState) {
        self.0.restore_partial(state);
    }

    #[inline(always)]
    fn is_partial_supported() -> bool {
        I::is_partial_supported()
    }

    #[inline(always)]
    fn is_partial(&self) -> bool {
        self.0.is_partial()
    }
}

impl<I> Offset for Bits<I>
where
    I: Offset,
{
    #[inline(always)]
    fn offset_from(&self, start: &Self) -> usize {
        self.0.of
```
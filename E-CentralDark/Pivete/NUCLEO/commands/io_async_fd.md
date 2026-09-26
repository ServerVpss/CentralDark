# COMANDO - io_async_fd.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\tests\io_async_fd.rs
**SHA:** 329603dcbed4cbde
**Timestamp:** 2026-08-28T02:36:21.798852
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: make this a loom test
- // TODO: make this a loom test

### Ouro Bruto (primeiros 5000 chars)
```
#![warn(rust_2018_idioms)]
#![cfg(all(unix, feature = "full"))]

use std::os::unix::io::{AsRawFd, RawFd};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use std::time::Duration;
use std::{
    future::Future,
    io::{self, ErrorKind, Read, Write},
    os::fd::OwnedFd,
    task::{Context, Waker},
};

use nix::unistd::{read, write};

use futures::poll;

use tokio::io::unix::{AsyncFd, AsyncFdReadyGuard};
use tokio::io::Interest;
use tokio_test::{assert_err, assert_pending};

struct TestWaker {
    inner: Arc<TestWakerInner>,
    waker: Waker,
}

#[derive(Default)]
struct TestWakerInner {
    awoken: AtomicBool,
}

impl futures::task::ArcWake for TestWakerInner {
    fn wake_by_ref(arc_self: &Arc<Self>) {
        arc_self.awoken.store(true, Ordering::SeqCst);
    }
}

impl TestWaker {
    fn new() -> Self {
        let inner: Arc<TestWakerInner> = Default::default();

        Self {
            inner: inner.clone(),
            waker: futures::task::waker(inner),
        }
    }

    fn awoken(&self) -> bool {
        self.inner.awoken.swap(false, Ordering::SeqCst)
    }

    fn context(&self) -> Context<'_> {
        Context::from_waker(&self.waker)
    }
}

#[derive(Debug)]
struct FileDescriptor {
    fd: std::os::fd::OwnedFd,
}

impl AsRawFd for FileDescriptor {
    fn as_raw_fd(&self) -> RawFd {
        self.fd.as_raw_fd()
    }
}

impl Read for &FileDescriptor {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        read(&self.fd, buf).map_err(io::Error::from)
    }
}

impl Read for FileDescriptor {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        (self as &Self).read(buf)
    }
}

impl Write for &FileDescriptor {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        write(&self.fd, buf).map_err(io::Error::from)
    }

    fn flush(&mut self) -> io::Result<()> {
        Ok(())
    }
}

impl Write for FileDescriptor {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        (self as &Self).write(buf)
    }

    fn flush(&mut self) -> io::Result<()> {
        (self as &Self).flush()
    }
}

fn set_nonblocking(fd: &OwnedFd) {
    use nix::fcntl::{OFlag, F_GETFL, F_SETFL};

    let flags = nix::fcntl::fcntl(fd, F_GETFL).expect("fcntl(F_GETFL)");

    if flags < 0 {
        panic!(
            "bad return value from fcntl(F_GETFL): {} ({:?})",
            flags,
            nix::Error::last()
        );
    }

    let flags = OFlag::from_bits_truncate(flags) | OFlag::O_NONBLOCK;

    nix::fcntl::fcntl(fd, F_SETFL(flags)).expect("fcntl(F_SETFL)");
}

fn socketpair() -> (FileDescriptor, FileDescriptor) {
    use nix::sys::socket::{self, AddressFamily, SockFlag, SockType};

    let (fd_a, fd_b) = socket::socketpair(
        AddressFamily::Unix,
        SockType::Stream,
        None,
        SockFlag::empty(),
    )
    .expect("socketpair");
    let fds = (FileDescriptor { fd: fd_a }, FileDescriptor { fd: fd_b });

    set_nonblocking(&fds.0.fd);
    set_nonblocking(&fds.1.fd);

    fds
}

fn drain(mut fd: &FileDescriptor, mut amt: usize) {
    let mut buf = [0u8; 512];
    while amt > 0 {
        match fd.read(&mut buf[..]) {
            Err(e) if e.kind() == ErrorKind::WouldBlock => {}
            Ok(0) => panic!("unexpected EOF"),
            Err(e) => panic!("unexpected error: {e:?}"),
            Ok(x) => amt -= x,
        }
    }
}

#[tokio::test]
async fn initially_writable() {
    let (a, b) = socketpair();

    let afd_a = AsyncFd::new(a).unwrap();
    let afd_b = AsyncFd::new(b).unwrap();

    afd_a.writable().await.unwrap().clear_ready();
    afd_b.writable().await.unwrap().clear_ready();

    tokio::select! {
        biased;
        _ = tokio::time::sleep(Duration::from_millis(10)) => {},
        _ = afd_a.readable() => panic!("Unexpected readable state"),
        _ = afd_b.readable() => panic!("Unexpected readable state"),
    }
}

#[tokio::test]
async fn reset_readable() {
    let (a, mut b) = socketpair();

    let afd_a = AsyncFd::new(a).unwrap();

    let readable = afd_a.readable();
    tokio::pin!(readable);

    tokio::select! {
        _ = readable.as_mut() => panic!(),
        _ = tokio::time::sleep(Duration::from_millis(10)) => {}
    }

    b.write_all(b"0").unwrap();

    let mut guard = readable.await.unwrap();

    guard
        .try_io(|_| afd_a.get_ref().read(&mut [0]))
        .unwrap()
        .unwrap();

    // `a` is not readable, but the reactor still thinks it is
    // (because we have not observed a not-ready error yet)
    afd_a.readable().await.unwrap().retain_ready();

    // Explicitly clear the ready state
    guard.clear_ready();

    let readable = afd_a.readable();
    tokio::pin!(readable);

    tokio::select! {
        _ = readable.as_mut() => panic!(),
        _ = tokio::time::sleep(Duration::from_millis(10)) => {}
    }

    b.write_all(b"0").unwrap();

    // We can observe the new readable event
    afd_a.readable().await.unwrap().clear_ready();
}

#[tokio::test]
async fn reset_writabl
```
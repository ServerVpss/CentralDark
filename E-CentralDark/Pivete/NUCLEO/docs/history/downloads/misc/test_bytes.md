# OUTRO - test_bytes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\bytes-1.12.1\tests\test_bytes.rs
**SHA:** 2b102b8c04cd4507
**Timestamp:** 2026-08-28T02:33:11.504977
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn test_slice_ref(bytes: &Bytes, start: usize, end: usize, expected: &[u8]) {
- let ptr_start = buf.as_ptr();
- let empty_start = buf.slice(..0);
- let ptr_start = buf.as_ptr();
- let ptr_start = buf.as_ptr();
- let empty_start = buf.split_to(0);
- let ptr_start = buf.as_ptr();
- let ptr_start = buf.as_ptr();
- let empty_start = buf.split_to(0);

### Ouro Bruto (primeiros 5000 chars)
```
#![warn(rust_2018_idioms)]

use bytes::{Buf, BufMut, Bytes, BytesMut};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

use std::panic::{self, AssertUnwindSafe};

const LONG: &[u8] = b"mary had a little lamb, little lamb, little lamb";
const SHORT: &[u8] = b"hello world";

fn is_sync<T: Sync>() {}
fn is_send<T: Send>() {}

#[test]
fn test_bounds() {
    is_sync::<Bytes>();
    is_sync::<BytesMut>();
    is_send::<Bytes>();
    is_send::<BytesMut>();
}

#[test]
fn test_layout() {
    use std::mem;

    assert_eq!(
        mem::size_of::<Bytes>(),
        mem::size_of::<usize>() * 4,
        "Bytes size should be 4 words",
    );
    assert_eq!(
        mem::size_of::<BytesMut>(),
        mem::size_of::<usize>() * 4,
        "BytesMut should be 4 words",
    );

    assert_eq!(
        mem::size_of::<Bytes>(),
        mem::size_of::<Option<Bytes>>(),
        "Bytes should be same size as Option<Bytes>",
    );

    assert_eq!(
        mem::size_of::<BytesMut>(),
        mem::size_of::<Option<BytesMut>>(),
        "BytesMut should be same size as Option<BytesMut>",
    );
}

#[test]
fn from_slice() {
    let a = Bytes::from(&b"abcdefgh"[..]);
    assert_eq!(a, b"abcdefgh"[..]);
    assert_eq!(a, &b"abcdefgh"[..]);
    assert_eq!(a, Vec::from(&b"abcdefgh"[..]));
    assert_eq!(b"abcdefgh"[..], a);
    assert_eq!(&b"abcdefgh"[..], a);
    assert_eq!(Vec::from(&b"abcdefgh"[..]), a);

    let a = BytesMut::from(&b"abcdefgh"[..]);
    assert_eq!(a, b"abcdefgh"[..]);
    assert_eq!(a, &b"abcdefgh"[..]);
    assert_eq!(a, Vec::from(&b"abcdefgh"[..]));
    assert_eq!(b"abcdefgh"[..], a);
    assert_eq!(&b"abcdefgh"[..], a);
    assert_eq!(Vec::from(&b"abcdefgh"[..]), a);
}

#[test]
fn fmt() {
    let a = format!("{:?}", Bytes::from(&b"abcdefg"[..]));
    let b = "b\"abcdefg\"";

    assert_eq!(a, b);

    let a = format!("{:?}", BytesMut::from(&b"abcdefg"[..]));
    assert_eq!(a, b);
}

#[test]
fn fmt_write() {
    use std::fmt::Write;
    let s = String::from_iter((0..10).map(|_| "abcdefg"));

    let mut a = BytesMut::with_capacity(64);
    write!(a, "{}", &s[..64]).unwrap();
    assert_eq!(a, s[..64].as_bytes());

    let mut b = BytesMut::with_capacity(64);
    write!(b, "{}", &s[..32]).unwrap();
    write!(b, "{}", &s[32..64]).unwrap();
    assert_eq!(b, s[..64].as_bytes());

    let mut c = BytesMut::with_capacity(64);
    write!(c, "{}", s).unwrap();
    assert_eq!(c, s[..].as_bytes());
}

#[test]
fn len() {
    let a = Bytes::from(&b"abcdefg"[..]);
    assert_eq!(a.len(), 7);

    let a = BytesMut::from(&b"abcdefg"[..]);
    assert_eq!(a.len(), 7);

    let a = Bytes::from(&b""[..]);
    assert!(a.is_empty());

    let a = BytesMut::from(&b""[..]);
    assert!(a.is_empty());
}

#[test]
fn index() {
    let a = Bytes::from(&b"hello world"[..]);
    assert_eq!(a[0..5], *b"hello");
}

#[test]
fn slice() {
    let a = Bytes::from(&b"hello world"[..]);

    let b = a.slice(3..5);
    assert_eq!(b, b"lo"[..]);

    let b = a.slice(0..0);
    assert_eq!(b, b""[..]);

    let b = a.slice(3..3);
    assert_eq!(b, b""[..]);

    let b = a.slice(a.len()..a.len());
    assert_eq!(b, b""[..]);

    let b = a.slice(..5);
    assert_eq!(b, b"hello"[..]);

    let b = a.slice(3..);
    assert_eq!(b, b"lo world"[..]);
}

#[test]
#[should_panic]
fn slice_oob_1() {
    let a = Bytes::from(&b"hello world"[..]);
    a.slice(5..44);
}

#[test]
#[should_panic]
fn slice_oob_2() {
    let a = Bytes::from(&b"hello world"[..]);
    a.slice(44..49);
}

#[test]
#[should_panic]
fn slice_start_greater_than_end() {
    let a = Bytes::from(&b"hello world"[..]);
    a.slice(5..3);
}

#[test]
fn split_off() {
    let mut hello = Bytes::from(&b"helloworld"[..]);
    let world = hello.split_off(5);

    assert_eq!(hello, &b"hello"[..]);
    assert_eq!(world, &b"world"[..]);

    let mut hello = BytesMut::from(&b"helloworld"[..]);
    let world = hello.split_off(5);

    assert_eq!(hello, &b"hello"[..]);
    assert_eq!(world, &b"world"[..]);
}

#[test]
#[should_panic]
fn split_off_oob() {
    let mut hello = Bytes::from(&b"helloworld"[..]);
    let _ = hello.split_off(44);
}

#[test]
#[should_panic = "split_off out of bounds"]
fn bytes_mut_split_off_oob() {
    let mut hello = BytesMut::from(&b"helloworld"[..]);
    let _ = hello.split_off(44);
}

#[test]
fn split_off_uninitialized() {
    let mut bytes = BytesMut::with_capacity(1024);
    let other = bytes.split_off(128);

    assert_eq!(bytes.len(), 0);
    assert_eq!(bytes.capacity(), 128);

    assert_eq!(other.len(), 0);
    assert_eq!(other.capacity(), 896);
}

#[test]
fn split_off_to_loop() {
    let s = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for i in 0..(s.len() + 1) {
        {
            let mut bytes = Bytes::from(&s[..]);
            let off = bytes.split_off(i);
            assert_eq!(i, bytes.len());
            let mut sum = Vec::new();
            sum.extend(bytes.iter());
            sum.extend(off.iter());
            assert_eq!(&s[..],
```
# COMANDO - decoder_tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\base64-0.22.1\src\read\decoder_tests.rs
**SHA:** 66ec39bf6e86f21f
**Timestamp:** 2026-08-28T02:32:52.224891
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- delegate: &mut wrapped_reader,
- delegate: &mut decoder,
- delegate: io::Cursor::new(&b64_bytes),
- delegate: io::Cursor::new(&b64_bytes),
- delegate: &'b mut R,
- delegate: R,

### Ouro Bruto (primeiros 5000 chars)
```
use std::{
    cmp,
    io::{self, Read as _},
    iter,
};

use rand::{Rng as _, RngCore as _};

use super::decoder::{DecoderReader, BUF_SIZE};
use crate::{
    alphabet,
    engine::{general_purpose::STANDARD, Engine, GeneralPurpose},
    tests::{random_alphabet, random_config, random_engine},
    DecodeError, PAD_BYTE,
};

#[test]
fn simple() {
    let tests: &[(&[u8], &[u8])] = &[
        (&b"0"[..], &b"MA=="[..]),
        (b"01", b"MDE="),
        (b"012", b"MDEy"),
        (b"0123", b"MDEyMw=="),
        (b"01234", b"MDEyMzQ="),
        (b"012345", b"MDEyMzQ1"),
        (b"0123456", b"MDEyMzQ1Ng=="),
        (b"01234567", b"MDEyMzQ1Njc="),
        (b"012345678", b"MDEyMzQ1Njc4"),
        (b"0123456789", b"MDEyMzQ1Njc4OQ=="),
    ][..];

    for (text_expected, base64data) in tests.iter() {
        // Read n bytes at a time.
        for n in 1..base64data.len() + 1 {
            let mut wrapped_reader = io::Cursor::new(base64data);
            let mut decoder = DecoderReader::new(&mut wrapped_reader, &STANDARD);

            // handle errors as you normally would
            let mut text_got = Vec::new();
            let mut buffer = vec![0u8; n];
            while let Ok(read) = decoder.read(&mut buffer[..]) {
                if read == 0 {
                    break;
                }
                text_got.extend_from_slice(&buffer[..read]);
            }

            assert_eq!(
                text_got,
                *text_expected,
                "\nGot: {}\nExpected: {}",
                String::from_utf8_lossy(&text_got[..]),
                String::from_utf8_lossy(text_expected)
            );
        }
    }
}

// Make sure we error out on trailing junk.
#[test]
fn trailing_junk() {
    let tests: &[&[u8]] = &[&b"MDEyMzQ1Njc4*!@#$%^&"[..], b"MDEyMzQ1Njc4OQ== "][..];

    for base64data in tests.iter() {
        // Read n bytes at a time.
        for n in 1..base64data.len() + 1 {
            let mut wrapped_reader = io::Cursor::new(base64data);
            let mut decoder = DecoderReader::new(&mut wrapped_reader, &STANDARD);

            // handle errors as you normally would
            let mut buffer = vec![0u8; n];
            let mut saw_error = false;
            loop {
                match decoder.read(&mut buffer[..]) {
                    Err(_) => {
                        saw_error = true;
                        break;
                    }
                    Ok(0) => break,
                    Ok(_len) => (),
                }
            }

            assert!(saw_error);
        }
    }
}

#[test]
fn handles_short_read_from_delegate() {
    let mut rng = rand::thread_rng();
    let mut bytes = Vec::new();
    let mut b64 = String::new();
    let mut decoded = Vec::new();

    for _ in 0..10_000 {
        bytes.clear();
        b64.clear();
        decoded.clear();

        let size = rng.gen_range(0..(10 * BUF_SIZE));
        bytes.extend(iter::repeat(0).take(size));
        bytes.truncate(size);
        rng.fill_bytes(&mut bytes[..size]);
        assert_eq!(size, bytes.len());

        let engine = random_engine(&mut rng);
        engine.encode_string(&bytes[..], &mut b64);

        let mut wrapped_reader = io::Cursor::new(b64.as_bytes());
        let mut short_reader = RandomShortRead {
            delegate: &mut wrapped_reader,
            rng: &mut rng,
        };

        let mut decoder = DecoderReader::new(&mut short_reader, &engine);

        let decoded_len = decoder.read_to_end(&mut decoded).unwrap();
        assert_eq!(size, decoded_len);
        assert_eq!(&bytes[..], &decoded[..]);
    }
}

#[test]
fn read_in_short_increments() {
    let mut rng = rand::thread_rng();
    let mut bytes = Vec::new();
    let mut b64 = String::new();
    let mut decoded = Vec::new();

    for _ in 0..10_000 {
        bytes.clear();
        b64.clear();
        decoded.clear();

        let size = rng.gen_range(0..(10 * BUF_SIZE));
        bytes.extend(iter::repeat(0).take(size));
        // leave room to play around with larger buffers
        decoded.extend(iter::repeat(0).take(size * 3));

        rng.fill_bytes(&mut bytes[..]);
        assert_eq!(size, bytes.len());

        let engine = random_engine(&mut rng);

        engine.encode_string(&bytes[..], &mut b64);

        let mut wrapped_reader = io::Cursor::new(&b64[..]);
        let mut decoder = DecoderReader::new(&mut wrapped_reader, &engine);

        consume_with_short_reads_and_validate(&mut rng, &bytes[..], &mut decoded, &mut decoder);
    }
}

#[test]
fn read_in_short_increments_with_short_delegate_reads() {
    let mut rng = rand::thread_rng();
    let mut bytes = Vec::new();
    let mut b64 = String::new();
    let mut decoded = Vec::new();

    for _ in 0..10_000 {
        bytes.clear();
        b64.clear();
        decoded.clear();

        let size = rng.gen_range(0..(10 * BUF_SIZE));
        bytes.extend(iter::repeat(0).take(size));
        // leave room to play around with larger buffers
        decoded.extend
```
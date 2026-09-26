# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\alloc-no-stdlib-2.0.4\src\tests.rs
**SHA:** c3c89714a3e02721
**Timestamp:** 2026-08-28T02:32:21.426412
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- free_list_start : 4,

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(unused_imports)]
#![allow(dead_code)]
#[cfg(test)]
extern crate core;
use core::ops;
use super::{Allocator, SliceWrapperMut, SliceWrapper,
            StackAllocator, AllocatedStackMemory, CallocBackingStore};

struct StackAllocatedFreelist4<'a, T : 'a> {
   freelist : [&'a mut [T]; 4],
}


impl<'a, T: 'a> SliceWrapper<&'a mut[T]> for StackAllocatedFreelist4<'a, T> {
    fn slice(& self) -> & [&'a mut[T]] {
        return & self.freelist;
    }
}

impl<'a, T: 'a> SliceWrapperMut<&'a mut [T]> for StackAllocatedFreelist4<'a, T> {
    fn slice_mut(& mut self) ->&mut [&'a mut [T]] {
        return &mut self.freelist;
    }
}

impl<'a, T: 'a> ops::Index<usize> for StackAllocatedFreelist4<'a, T> {
    type Output = [T];
    fn index<'b> (&'b self, _index : usize) -> &'b [T] {
        return &self.freelist[_index];
    }
}

impl<'a, T: 'a> ops::IndexMut<usize> for StackAllocatedFreelist4<'a, T> {
    fn index_mut<'b>(&'b mut self, _index : usize) -> &'b mut [T] {
        return &mut self.freelist[_index];
    }
}


#[test]
fn integration_test() {
  let mut global_buffer : [u8; 65536] = [0; 65536];
  let mut ags = StackAllocator::<u8, StackAllocatedFreelist4<u8> > {
      nop : &mut [],
      system_resources :  StackAllocatedFreelist4::<u8> {
          freelist : [&mut[],&mut[],&mut[],&mut[],],
      },
      free_list_start : 4,
      free_list_overflow_count : 0,
      initializer : bzero,
  };
  ags.free_cell(AllocatedStackMemory::<u8>{mem:&mut global_buffer});

  {
  let mut x = ags.alloc_cell(9999);
  x.slice_mut()[0] = 4;
  let mut y = ags.alloc_cell(4);
  y[0] = 5;
  ags.free_cell(y);

  let mut three = ags.alloc_cell(3);
  three[0] = 6;
  ags.free_cell(three);

  let mut z = ags.alloc_cell(4);
  z.slice_mut()[1] = 8;
  let mut reget_three = ags.alloc_cell(4);
  reget_three.slice_mut()[1] = 9;
  //y.mem[0] = 6; // <-- this is an error (use after free)
  assert_eq!(x[0], 4);
  assert_eq!(z[0], 6);
  assert_eq!(z[1], 8);
  assert_eq!(reget_three[0], 0);
  assert_eq!(reget_three[1], 9);
  let mut _z = ags.alloc_cell(1);
  }

}

```

---

# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\base64-0.22.1\src\engine\tests.rs
**SHA:** 2cc8d1431f40f5b9
**Timestamp:** 2026-08-28T02:32:51.583874
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let padding_start = padding_end.saturating_sub(padding_len);
- let padding_start = encoded.len() - padding_len;

### Ouro Bruto (primeiros 5000 chars)
```
// rstest_reuse template functions have unused variables
#![allow(unused_variables)]

use rand::{
    self,
    distributions::{self, Distribution as _},
    rngs, Rng as _, SeedableRng as _,
};
use rstest::rstest;
use rstest_reuse::{apply, template};
use std::{collections, fmt, io::Read as _};

use crate::{
    alphabet::{Alphabet, STANDARD},
    encode::add_padding,
    encoded_len,
    engine::{
        general_purpose, naive, Config, DecodeEstimate, DecodeMetadata, DecodePaddingMode, Engine,
    },
    read::DecoderReader,
    tests::{assert_encode_sanity, random_alphabet, random_config},
    DecodeError, DecodeSliceError, PAD_BYTE,
};

// the case::foo syntax includes the "foo" in the generated test method names
#[template]
#[rstest(engine_wrapper,
case::general_purpose(GeneralPurposeWrapper {}),
case::naive(NaiveWrapper {}),
case::decoder_reader(DecoderReaderEngineWrapper {}),
)]
fn all_engines<E: EngineWrapper>(engine_wrapper: E) {}

/// Some decode tests don't make sense for use with `DecoderReader` as they are difficult to
/// reason about or otherwise inapplicable given how DecoderReader slice up its input along
/// chunk boundaries.
#[template]
#[rstest(engine_wrapper,
case::general_purpose(GeneralPurposeWrapper {}),
case::naive(NaiveWrapper {}),
)]
fn all_engines_except_decoder_reader<E: EngineWrapper>(engine_wrapper: E) {}

#[apply(all_engines)]
fn rfc_test_vectors_std_alphabet<E: EngineWrapper>(engine_wrapper: E) {
    let data = vec![
        ("", ""),
        ("f", "Zg=="),
        ("fo", "Zm8="),
        ("foo", "Zm9v"),
        ("foob", "Zm9vYg=="),
        ("fooba", "Zm9vYmE="),
        ("foobar", "Zm9vYmFy"),
    ];

    let engine = E::standard();
    let engine_no_padding = E::standard_unpadded();

    for (orig, encoded) in &data {
        let encoded_without_padding = encoded.trim_end_matches('=');

        // unpadded
        {
            let mut encode_buf = [0_u8; 8];
            let mut decode_buf = [0_u8; 6];

            let encode_len =
                engine_no_padding.internal_encode(orig.as_bytes(), &mut encode_buf[..]);
            assert_eq!(
                &encoded_without_padding,
                &std::str::from_utf8(&encode_buf[0..encode_len]).unwrap()
            );
            let decode_len = engine_no_padding
                .decode_slice_unchecked(encoded_without_padding.as_bytes(), &mut decode_buf[..])
                .unwrap();
            assert_eq!(orig.len(), decode_len);

            assert_eq!(
                orig,
                &std::str::from_utf8(&decode_buf[0..decode_len]).unwrap()
            );

            // if there was any padding originally, the no padding engine won't decode it
            if encoded.as_bytes().contains(&PAD_BYTE) {
                assert_eq!(
                    Err(DecodeError::InvalidPadding),
                    engine_no_padding.decode(encoded)
                )
            }
        }

        // padded
        {
            let mut encode_buf = [0_u8; 8];
            let mut decode_buf = [0_u8; 6];

            let encode_len = engine.internal_encode(orig.as_bytes(), &mut encode_buf[..]);
            assert_eq!(
                // doesn't have padding added yet
                &encoded_without_padding,
                &std::str::from_utf8(&encode_buf[0..encode_len]).unwrap()
            );
            let pad_len = add_padding(encode_len, &mut encode_buf[encode_len..]);
            assert_eq!(encoded.as_bytes(), &encode_buf[..encode_len + pad_len]);

            let decode_len = engine
                .decode_slice_unchecked(encoded.as_bytes(), &mut decode_buf[..])
                .unwrap();
            assert_eq!(orig.len(), decode_len);

            assert_eq!(
                orig,
                &std::str::from_utf8(&decode_buf[0..decode_len]).unwrap()
            );

            // if there was (canonical) padding, and we remove it, the standard engine won't decode
            if encoded.as_bytes().contains(&PAD_BYTE) {
                assert_eq!(
                    Err(DecodeError::InvalidPadding),
                    engine.decode(encoded_without_padding)
                )
            }
        }
    }
}

#[apply(all_engines)]
fn roundtrip_random<E: EngineWrapper>(engine_wrapper: E) {
    let mut rng = seeded_rng();

    let mut orig_data = Vec::<u8>::new();
    let mut encode_buf = Vec::<u8>::new();
    let mut decode_buf = Vec::<u8>::new();

    let len_range = distributions::Uniform::new(1, 1_000);

    for _ in 0..10_000 {
        let engine = E::random(&mut rng);

        orig_data.clear();
        encode_buf.clear();
        decode_buf.clear();

        let (orig_len, _, encoded_len) = generate_random_encoded_data(
            &engine,
            &mut orig_data,
            &mut encode_buf,
            &mut rng,
            &len_range,
        );

        // exactly the right size
        decode_buf.resize(orig_len, 0);

        let dec_len = engine
            .decode_slice_unchecked(&encode_buf[0..e
```

---

# OUTRO - tests.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\.github\workflows\tests.yml
**SHA:** 506577c3093e7725
**Timestamp:** 2026-08-28T02:33:22.270962
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup component add rustfmt clippy

### Ouro Bruto (primeiros 5000 chars)
```
name: tests

on:
  push:
    paths-ignore:
      - 'LICENSE-*'
      - '**.md'
  pull_request:
    paths-ignore:
      - 'LICENSE-*'
      - '**.md'

jobs:
  linters:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Install rust toolchain
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          override: true
      - name: Install rustfmt and clippy
        run: rustup component add rustfmt clippy
      - name: Cargo fmt
        uses: actions-rs/cargo@v1
        with:
          command: fmt
          args: -- --check
      - name: Cargo clippy
        uses: actions-rs/cargo@v1
        with:
          command: clippy
          args: -- -D warnings

  tests:
    strategy:
      matrix:
        os: [ ubuntu-20.04, windows-2019, macos-10.15]
        rust: [ stable ]

    needs: [linters]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Install rust toolchain
        uses: actions-rs/toolchain@v1
        with:
          toolchain: ${{ matrix.rust }}
          override: true
      - name: Test
        uses: actions-rs/cargo@v1
        with:
          command: test
          toolchain: ${{ matrix.rust }}
          args: --verbose 


```

---

# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cssparser-0.36.0\src\tests.rs
**SHA:** e7b0658dfdc13717
**Timestamp:** 2026-08-28T02:33:38.907269
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn run_raw_json_tests<F: Fn(Value, Value)>(json_data: &str, run: F) {
- _declaration_start: &ParserState,
- let start = input.state();

### Ouro Bruto (primeiros 5000 chars)
```
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#[cfg(feature = "bench")]
extern crate test;

use serde_json::{json, Map, Value};

#[cfg(feature = "bench")]
use crate::parser::ArbitrarySubstitutionFunctions;

#[cfg(feature = "bench")]
use self::test::Bencher;

use super::{
    parse_important, parse_nth, parse_one_declaration, parse_one_rule, stylesheet_encoding,
    AtRuleParser, BasicParseError, BasicParseErrorKind, CowRcStr, DeclarationParser, Delimiter,
    EncodingSupport, ParseError, ParseErrorKind, Parser, ParserInput, ParserState,
    QualifiedRuleParser, RuleBodyItemParser, RuleBodyParser, SourceLocation, StyleSheetParser,
    ToCss, Token, TokenSerializationType, UnicodeRange,
};

macro_rules! JArray {
    ($($e: expr,)*) => { JArray![ $( $e ),* ] };
    ($($e: expr),*) => { Value::Array(vec!( $( $e.to_json() ),* )) }
}

fn almost_equals(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Number(a), Value::Number(b)) => {
            let a = a.as_f64().unwrap();
            let b = b.as_f64().unwrap();
            (a - b).abs() <= a.abs() * 1e-6
        }

        (&Value::Bool(a), &Value::Bool(b)) => a == b,
        (Value::String(a), Value::String(b)) => a == b,
        (Value::Array(a), Value::Array(b)) => {
            a.len() == b.len() && a.iter().zip(b.iter()).all(|(a, b)| almost_equals(a, b))
        }
        (&Value::Object(_), &Value::Object(_)) => panic!("Not implemented"),
        (&Value::Null, &Value::Null) => true,
        _ => false,
    }
}

fn normalize(json: &mut Value) {
    match *json {
        Value::Array(ref mut list) => {
            for item in list.iter_mut() {
                normalize(item)
            }
        }
        Value::String(ref mut s) => {
            if *s == "extra-input" || *s == "empty" {
                *s = "invalid".to_string()
            }
        }
        _ => {}
    }
}

fn assert_json_eq(results: Value, mut expected: Value, message: &str) {
    normalize(&mut expected);
    if !almost_equals(&results, &expected) {
        println!(
            "{}",
            ::difference::Changeset::new(
                &serde_json::to_string_pretty(&results).unwrap(),
                &serde_json::to_string_pretty(&expected).unwrap(),
                "\n",
            )
        );
        panic!("{}", message)
    }
}

fn run_raw_json_tests<F: Fn(Value, Value)>(json_data: &str, run: F) {
    let items = match serde_json::from_str(json_data) {
        Ok(Value::Array(items)) => items,
        other => panic!("Invalid JSON: {:?}", other),
    };
    assert!(items.len() % 2 == 0);
    let mut input = None;
    for item in items.into_iter() {
        match (&input, item) {
            (&None, json_obj) => input = Some(json_obj),
            (&Some(_), expected) => {
                let input = input.take().unwrap();
                run(input, expected)
            }
        };
    }
}

fn run_json_tests<F: Fn(&mut Parser) -> Value>(json_data: &str, parse: F) {
    run_raw_json_tests(json_data, |input, expected| match input {
        Value::String(input) => {
            let mut parse_input = ParserInput::new(&input);
            let result = parse(&mut Parser::new(&mut parse_input));
            assert_json_eq(result, expected, &input);
        }
        _ => panic!("Unexpected JSON"),
    });
}

#[test]
fn component_value_list() {
    run_json_tests(
        include_str!("css-parsing-tests/component_value_list.json"),
        |input| Value::Array(component_values_to_json(input)),
    );
}

#[test]
fn one_component_value() {
    run_json_tests(
        include_str!("css-parsing-tests/one_component_value.json"),
        |input| {
            let result: Result<Value, ParseError<()>> = input.parse_entirely(|input| {
                Ok(one_component_value_to_json(input.next()?.clone(), input))
            });
            result.unwrap_or(JArray!["error", "invalid"])
        },
    );
}

#[test]
fn declaration_list() {
    run_json_tests(
        include_str!("css-parsing-tests/declaration_list.json"),
        |input| {
            Value::Array(
                RuleBodyParser::new(input, &mut JsonParser)
                    .map(|result| result.unwrap_or(JArray!["error", "invalid"]))
                    .collect(),
            )
        },
    );
}

#[test]
fn one_declaration() {
    run_json_tests(
        include_str!("css-parsing-tests/one_declaration.json"),
        |input| {
            parse_one_declaration(input, &mut JsonParser).unwrap_or(JArray!["error", "invalid"])
        },
    );
}

#[test]
fn rule_list() {
    run_json_tests(include_str!("css-parsing-tests/rule_list.json"), |input| {
        Value::Array(
            RuleBodyParser::new(input, &mut JsonParser)
                .map(|result| result.unwrap_or(JArray!["error", "invalid"]))
                .collect(),
        )
    });
```

---

# OUTRO - tests.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\ico-0.5.0\.github\workflows\tests.yml
**SHA:** c2b223d9e88c6431
**Timestamp:** 2026-08-28T02:34:17.610324
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup component add rustfmt clippy

### Ouro Bruto (primeiros 5000 chars)
```
name: tests

on:
  push:
    paths-ignore:
      - 'LICENSE'
      - '**.md'
  pull_request:
    paths-ignore:
      - 'LICENSE'
      - '**.md'

jobs:
  linters:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Install rust toolchain
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          override: true
      - name: Install rustfmt and clippy
        run: rustup component add rustfmt clippy
      - name: Cargo fmt
        uses: actions-rs/cargo@v1
        with:
          command: fmt
          args: -- --check
      - name: Cargo clippy
        uses: actions-rs/cargo@v1
        with:
          command: clippy
          args: -- -D warnings

  tests:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        rust: [ stable ]

    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Install rust toolchain
        uses: actions-rs/toolchain@v1
        with:
          toolchain: ${{ matrix.rust }}
          override: true
      - name: Test
        uses: actions-rs/cargo@v1
        with:
          command: test
          toolchain: ${{ matrix.rust }}
          args: --verbose

```

---

# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\fs\file\tests.rs
**SHA:** 16371becf814fdbd
**Timestamp:** 2026-08-28T02:36:11.571820
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Move under write

### Ouro Bruto (primeiros 5000 chars)
```
use super::*;
use crate::{
    fs::mocks::*,
    io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt},
};
use mockall::{predicate::eq, Sequence};
use tokio_test::{assert_pending, assert_ready_err, assert_ready_ok, task};

const HELLO: &[u8] = b"hello world...";
const FOO: &[u8] = b"foo bar baz...";

#[test]
fn open_read() {
    let mut file = MockFile::default();
    file.expect_inner_read().once().returning(|buf| {
        buf[0..HELLO.len()].copy_from_slice(HELLO);
        Ok(HELLO.len())
    });
    let mut file = File::from_std(file);

    let mut buf = [0; 1024];
    let mut t = task::spawn(file.read(&mut buf));

    assert_eq!(0, pool::len());
    assert_pending!(t.poll());

    assert_eq!(1, pool::len());

    pool::run_one();

    assert!(t.is_woken());

    let n = assert_ready_ok!(t.poll());
    assert_eq!(n, HELLO.len());
    assert_eq!(&buf[..n], HELLO);
}

#[test]
fn read_twice_before_dispatch() {
    let mut file = MockFile::default();
    file.expect_inner_read().once().returning(|buf| {
        buf[0..HELLO.len()].copy_from_slice(HELLO);
        Ok(HELLO.len())
    });
    let mut file = File::from_std(file);

    let mut buf = [0; 1024];
    let mut t = task::spawn(file.read(&mut buf));

    assert_pending!(t.poll());
    assert_pending!(t.poll());

    assert_eq!(pool::len(), 1);
    pool::run_one();

    assert!(t.is_woken());

    let n = assert_ready_ok!(t.poll());
    assert_eq!(&buf[..n], HELLO);
}

#[test]
fn read_with_smaller_buf() {
    let mut file = MockFile::default();
    file.expect_inner_read().once().returning(|buf| {
        buf[0..HELLO.len()].copy_from_slice(HELLO);
        Ok(HELLO.len())
    });

    let mut file = File::from_std(file);

    {
        let mut buf = [0; 32];
        let mut t = task::spawn(file.read(&mut buf));
        assert_pending!(t.poll());
    }

    pool::run_one();

    {
        let mut buf = [0; 4];
        let mut t = task::spawn(file.read(&mut buf));
        let n = assert_ready_ok!(t.poll());
        assert_eq!(n, 4);
        assert_eq!(&buf[..], &HELLO[..n]);
    }

    // Calling again immediately succeeds with the rest of the buffer
    let mut buf = [0; 32];
    let mut t = task::spawn(file.read(&mut buf));
    let n = assert_ready_ok!(t.poll());
    assert_eq!(n, 10);
    assert_eq!(&buf[..n], &HELLO[4..]);

    assert_eq!(0, pool::len());
}

#[test]
fn read_with_bigger_buf() {
    let mut seq = Sequence::new();
    let mut file = MockFile::default();
    file.expect_inner_read()
        .once()
        .in_sequence(&mut seq)
        .returning(|buf| {
            buf[0..4].copy_from_slice(&HELLO[..4]);
            Ok(4)
        });
    file.expect_inner_read()
        .once()
        .in_sequence(&mut seq)
        .returning(|buf| {
            buf[0..HELLO.len() - 4].copy_from_slice(&HELLO[4..]);
            Ok(HELLO.len() - 4)
        });

    let mut file = File::from_std(file);

    {
        let mut buf = [0; 4];
        let mut t = task::spawn(file.read(&mut buf));
        assert_pending!(t.poll());
    }

    pool::run_one();

    {
        let mut buf = [0; 32];
        let mut t = task::spawn(file.read(&mut buf));
        let n = assert_ready_ok!(t.poll());
        assert_eq!(n, 4);
        assert_eq!(&buf[..n], &HELLO[..n]);
    }

    // Calling again immediately succeeds with the rest of the buffer
    let mut buf = [0; 32];
    let mut t = task::spawn(file.read(&mut buf));

    assert_pending!(t.poll());

    assert_eq!(1, pool::len());
    pool::run_one();

    assert!(t.is_woken());

    let n = assert_ready_ok!(t.poll());
    assert_eq!(n, 10);
    assert_eq!(&buf[..n], &HELLO[4..]);

    assert_eq!(0, pool::len());
}

#[test]
fn read_err_then_read_success() {
    let mut file = MockFile::default();
    let mut seq = Sequence::new();
    file.expect_inner_read()
        .once()
        .in_sequence(&mut seq)
        .returning(|_| Err(io::ErrorKind::Other.into()));
    file.expect_inner_read()
        .once()
        .in_sequence(&mut seq)
        .returning(|buf| {
            buf[0..HELLO.len()].copy_from_slice(HELLO);
            Ok(HELLO.len())
        });

    let mut file = File::from_std(file);

    {
        let mut buf = [0; 32];
        let mut t = task::spawn(file.read(&mut buf));
        assert_pending!(t.poll());

        pool::run_one();

        assert_ready_err!(t.poll());
    }

    {
        let mut buf = [0; 32];
        let mut t = task::spawn(file.read(&mut buf));
        assert_pending!(t.poll());

        pool::run_one();

        let n = assert_ready_ok!(t.poll());

        assert_eq!(n, HELLO.len());
        assert_eq!(&buf[..n], HELLO);
    }
}

#[test]
fn open_write() {
    let mut file = MockFile::default();
    file.expect_inner_write()
        .once()
        .with(eq(HELLO))
        .returning(|buf| Ok(buf.len()));

    let mut file = File::from_std(file);

    let mut t = task::spawn(file.write(HELLO));

    assert_eq!(0, pool::len());
    assert_ready_ok!(t.poll());

    assert_eq!(1, pool::l
```

---

# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\binary\bits\tests.rs
**SHA:** fc2629882bb5124e
**Timestamp:** 2026-08-28T02:37:38.521031
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let value_to_pattern = 0b0001;
- let value_to_pattern = 0b1111;

### Ouro Bruto (primeiros 5000 chars)
```
use super::*;
use crate::error::ErrMode;
use crate::error::InputError;
use crate::prelude::*;
use crate::Partial;

#[test]
/// Take the `bits` function and assert that remaining bytes are correctly returned, if the
/// previous bytes are fully consumed
fn test_complete_byte_consumption_bits() {
    let input = &[0x12, 0x34, 0x56, 0x78][..];

    // Take 3 bit slices with sizes [4, 8, 4].
    #[allow(clippy::type_complexity)]
    let result: ModalResult<(&[u8], (u8, u8, u8)), InputError<_>> =
        bits::<_, _, ErrMode<InputError<(&[u8], usize)>>, _, _>((
            take(4usize),
            take(8usize),
            take(4usize),
        ))
        .parse_peek(input);

    let output = result.expect("We take 2 bytes and the input is longer than 2 bytes");

    let remaining = output.0;
    assert_eq!(remaining, [0x56, 0x78]);

    let parsed = output.1;
    assert_eq!(parsed.0, 0x01);
    assert_eq!(parsed.1, 0x23);
    assert_eq!(parsed.2, 0x04);
}

#[test]
/// Take the `bits` function and assert that remaining bytes are correctly returned, if the
/// previous bytes are NOT fully consumed. Partially consumed bytes are supposed to be dropped.
/// I.e. if we consume 1.5 bytes of 4 bytes, 2 bytes will be returned, bits 13-16 will be
/// dropped.
fn test_partial_byte_consumption_bits() {
    let input = &[0x12, 0x34, 0x56, 0x78][..];

    // Take bit slices with sizes [4, 8].
    let result: ModalResult<(&[u8], (u8, u8)), InputError<_>> =
        bits::<_, _, ErrMode<InputError<(&[u8], usize)>>, _, _>((take(4usize), take(8usize)))
            .parse_peek(input);

    let output = result.expect("We take 1.5 bytes and the input is longer than 2 bytes");

    let remaining = output.0;
    assert_eq!(remaining, [0x56, 0x78]);

    let parsed = output.1;
    assert_eq!(parsed.0, 0x01);
    assert_eq!(parsed.1, 0x23);
}

#[test]
#[cfg(feature = "std")]
/// Ensure that in Incomplete error is thrown, if too few bytes are passed for a given parser.
fn test_incomplete_bits() {
    let input = Partial::new(&[0x12][..]);

    // Take bit slices with sizes [4, 8].
    let result: ModalResult<(_, (u8, u8)), InputError<_>> =
        bits::<_, _, ErrMode<InputError<(_, usize)>>, _, _>((take(4usize), take(8usize)))
            .parse_peek(input);

    assert!(result.is_err());
    let error = result.err().unwrap();
    assert_eq!("Parsing requires 2 more data", error.to_string());
}

#[test]
fn test_take_complete_0() {
    let input = &[0b00010010][..];
    let count = 0usize;
    assert_eq!(count, 0usize);
    let offset = 0usize;

    let result: ModalResult<((&[u8], usize), usize), InputError<_>> =
        take(count).parse_peek((input, offset));

    assert_eq!(result, Ok(((input, offset), 0)));
}

#[test]
fn test_take_complete_eof() {
    let input = &[0b00010010][..];

    let result: ModalResult<((&[u8], usize), usize), InputError<_>> =
        take(1usize).parse_peek((input, 8));

    assert_eq!(
        result,
        Err(crate::error::ErrMode::Backtrack(
            InputError::at((input, 8),)
        ))
    );
}

#[test]
fn test_take_complete_span_over_multiple_bytes() {
    let input = &[0b00010010, 0b00110100, 0b11111111, 0b11111111][..];

    let result: ModalResult<((&[u8], usize), usize), InputError<_>> =
        take(24usize).parse_peek((input, 4));

    assert_eq!(
        result,
        Ok((([0b11111111].as_ref(), 4), 0b1000110100111111111111))
    );
}

#[test]
fn test_take_partial_0() {
    let input = Partial::new(&[][..]);
    let count = 0usize;
    assert_eq!(count, 0usize);
    let offset = 0usize;

    let result: ModalResult<((_, usize), usize), InputError<_>> =
        take(count).parse_peek((input, offset));

    assert_eq!(result, Ok(((input, offset), 0)));
}

#[test]
fn test_pattern_partial_ok() {
    let input = Partial::new(&[0b00011111][..]);
    let offset = 0usize;
    let bits_to_take = 4usize;
    let value_to_pattern = 0b0001;

    let result: ModalResult<((_, usize), usize), InputError<_>> =
        pattern(value_to_pattern, bits_to_take).parse_peek((input, offset));

    assert_eq!(result, Ok(((input, bits_to_take), value_to_pattern)));
}

#[test]
fn test_pattern_partial_err() {
    let input = Partial::new(&[0b00011111][..]);
    let offset = 0usize;
    let bits_to_take = 4usize;
    let value_to_pattern = 0b1111;

    let result: ModalResult<((_, usize), usize), InputError<_>> =
        pattern(value_to_pattern, bits_to_take).parse_peek((input, offset));

    assert_eq!(
        result,
        Err(crate::error::ErrMode::Backtrack(InputError::at((
            input, offset
        ),)))
    );
}

#[test]
fn test_bool_0_complete() {
    let input = [0b10000000].as_ref();

    let result: ModalResult<((&[u8], usize), bool), InputError<_>> = bool.parse_peek((input, 0));

    assert_eq!(result, Ok(((input, 1), true)));
}

#[test]
fn test_bool_eof_complete() {
    let input = [0b10000000].as_ref();

    let result: ModalResult<((&[u8], usize), bool), InputError<_>> = bool.parse_peek
```

---

# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\stream\tests.rs
**SHA:** 7acc51c299d3fe7d
**Timestamp:** 2026-08-28T02:37:38.686445
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn bit_stream_inner(byte_len: usize, start: usize) {
- let start = start.min(byte_len * 8);
- let start = input.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "std")]
use proptest::prelude::*;

use crate::error::ErrMode;
use crate::error::ErrMode::Backtrack;
use crate::error::InputError;
use crate::token::literal;
use crate::{
    combinator::{separated, separated_pair},
    ModalResult, Parser,
};

use super::*;

#[cfg(feature = "std")]
#[test]
fn test_fxhashmap_compiles() {
    let input = "a=b";
    fn pair(i: &mut &str) -> ModalResult<(char, char)> {
        let out = separated_pair('a', '=', 'b').parse_next(i)?;
        Ok(out)
    }

    let _: rustc_hash::FxHashMap<char, char> = separated(0.., pair, ',').parse(input).unwrap();
}

#[test]
fn test_offset_u8() {
    let s = b"abcd123";
    let a = &s[..];
    let b = &a[2..];
    let c = &a[..4];
    let d = &a[3..5];
    assert_eq!(b.offset_from(&a), 2);
    assert_eq!(c.offset_from(&a), 0);
    assert_eq!(d.offset_from(&a), 3);
}

#[test]
fn test_offset_str() {
    let a = "abcřèÂßÇd123";
    let b = &a[7..];
    let c = &a[..5];
    let d = &a[5..9];
    assert_eq!(b.offset_from(&a), 7);
    assert_eq!(c.offset_from(&a), 0);
    assert_eq!(d.offset_from(&a), 5);
}

#[test]
#[cfg(feature = "alloc")]
fn test_bit_stream_empty() {
    let i = (&b""[..], 0);

    let actual = i.iter_offsets().collect::<alloc::vec::Vec<_>>();
    assert_eq!(actual, vec![]);

    let actual = i.eof_offset();
    assert_eq!(actual, 0);

    let actual = i.peek_token();
    assert_eq!(actual, None);

    let actual = i.offset_for(|b| b);
    assert_eq!(actual, None);

    let actual = i.offset_at(1);
    assert_eq!(actual, Err(Needed::new(1)));

    let actual_slice = i.peek_slice(0);
    assert_eq!(actual_slice, (&b""[..], 0, 0));
}

#[test]
#[cfg(feature = "alloc")]
fn test_bit_offset_empty() {
    let i = (&b""[..], 0);

    let actual = i.offset_from(&i);
    assert_eq!(actual, 0);
}

#[cfg(feature = "std")]
proptest! {
  #[test]
  #[cfg_attr(miri, ignore)]  // See https://github.com/AltSysrq/proptest/issues/253
  fn bit_stream(byte_len in 0..20usize, start in 0..160usize) {
        bit_stream_inner(byte_len, start);
  }
}

#[cfg(feature = "std")]
fn bit_stream_inner(byte_len: usize, start: usize) {
    let start = start.min(byte_len * 8);
    let start_byte = start / 8;
    let start_bit = start % 8;

    let bytes = vec![0b1010_1010; byte_len];
    let i = (&bytes[start_byte..], start_bit);

    let mut curr_i = i;
    let mut curr_offset = 0;
    while let Some(_token) = curr_i.peek_token() {
        let to_offset = curr_i.offset_from(&i);
        assert_eq!(curr_offset, to_offset);

        let actual_slice = i.peek_slice(curr_offset);
        let expected_slice = i.clone().peek_slice(curr_offset);
        assert_eq!(actual_slice, expected_slice);

        let at_offset = i.offset_at(curr_offset).unwrap();
        assert_eq!(curr_offset, at_offset);

        let eof_offset = curr_i.eof_offset();
        let eof_slice = curr_i.peek_slice(eof_offset);
        let eof_slice_i = (eof_slice.0, eof_slice.1);
        assert_eq!(eof_slice_i, curr_i);

        curr_offset += 1;
        let _ = curr_i.next_token();
    }
    assert_eq!(i.eof_offset(), curr_offset);
}

#[test]
fn test_partial_complete() {
    let mut i = Partial::new(&b""[..]);
    assert!(Partial::<&[u8]>::is_partial_supported());

    assert!(i.is_partial(), "incomplete by default");
    let incomplete_state = i.complete();
    assert!(!i.is_partial(), "the stream should be marked as complete");

    i.restore_partial(incomplete_state);
    assert!(i.is_partial(), "incomplete stream state should be restored");
}

#[test]
fn test_custom_slice() {
    type Token = usize;
    type TokenSlice<'i> = &'i [Token];

    let mut tokens: TokenSlice<'_> = &[1, 2, 3, 4];

    let input = &mut tokens;
    let start = input.checkpoint();
    let _ = input.next_token();
    let _ = input.next_token();
    let offset = input.offset_from(&start);
    assert_eq!(offset, 2);
}

#[test]
fn test_literal_support_char() {
    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>('π').parse_peek("π"),
        Ok(("", "π"))
    );
    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>('π').parse_peek("π3.14"),
        Ok(("3.14", "π"))
    );

    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>("π").parse_peek("π3.14"),
        Ok(("3.14", "π"))
    );

    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>('-').parse_peek("π"),
        Err(Backtrack(InputError::at("π")))
    );

    assert_eq!(
        literal::<_, Partial<&[u8]>, ErrMode<InputError<_>>>('π')
            .parse_peek(Partial::new(b"\xCF\x80")),
        Ok((Partial::new(Default::default()), "π".as_bytes()))
    );
    assert_eq!(
        literal::<_, &[u8], ErrMode<InputError<_>>>('π').parse_peek(b"\xCF\x80"),
        Ok((Default::default(), "π".as_bytes()))
    );

    assert_eq!(
        literal::<_, Partial<&[u8]>, ErrMode<InputError<_>>>('π')
            .parse_peek(Partial::new(b"\xCF\x803.14")),
        Ok((Partial::new(&b"3.14"[..]), "π".as_bytes()))
    );
    asser
```

---

# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\binary\bits\tests.rs
**SHA:** fdfbe8a7d5abb668
**Timestamp:** 2026-08-28T02:37:40.927686
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn bit_stream_inner(byte_len: usize, start: usize) {
- let start = start.min(byte_len * 8);

### Padroes
- let value_to_pattern = 0b0001;
- let value_to_pattern = 0b1111;

### Ouro Bruto (primeiros 5000 chars)
```
use super::*;
use crate::error::ErrMode;
use crate::error::InputError;
use crate::prelude::*;
use crate::stream::{Offset, Stream};
use crate::Partial;
#[cfg(feature = "std")]
use proptest::prelude::*;

#[test]
/// Take the `bits` function and assert that remaining bytes are correctly returned, if the
/// previous bytes are fully consumed
fn test_complete_byte_consumption_bits() {
    let input = &[0x12, 0x34, 0x56, 0x78][..];

    // Take 3 bit slices with sizes [4, 8, 4].
    #[allow(clippy::type_complexity)]
    let result: ModalResult<(&[u8], (u8, u8, u8)), InputError<_>> =
        bits::<_, _, ErrMode<InputError<Bits<&[u8]>>>, _, _>((
            take(4usize),
            take(8usize),
            take(4usize),
        ))
        .parse_peek(input);

    let output = result.expect("We take 2 bytes and the input is longer than 2 bytes");

    let remaining = output.0;
    assert_eq!(remaining, [0x56, 0x78]);

    let parsed = output.1;
    assert_eq!(parsed.0, 0x01);
    assert_eq!(parsed.1, 0x23);
    assert_eq!(parsed.2, 0x04);
}

#[test]
/// Take the `bits` function and assert that remaining bytes are correctly returned, if the
/// previous bytes are NOT fully consumed. Partially consumed bytes are supposed to be dropped.
/// I.e. if we consume 1.5 bytes of 4 bytes, 2 bytes will be returned, bits 13-16 will be
/// dropped.
fn test_partial_byte_consumption_bits() {
    let input = &[0x12, 0x34, 0x56, 0x78][..];

    // Take bit slices with sizes [4, 8].
    let result: ModalResult<(&[u8], (u8, u8)), InputError<_>> =
        bits::<_, _, ErrMode<InputError<Bits<&[u8]>>>, _, _>((take(4usize), take(8usize)))
            .parse_peek(input);

    let output = result.expect("We take 1.5 bytes and the input is longer than 2 bytes");

    let remaining = output.0;
    assert_eq!(remaining, [0x56, 0x78]);

    let parsed = output.1;
    assert_eq!(parsed.0, 0x01);
    assert_eq!(parsed.1, 0x23);
}

#[test]
#[cfg(feature = "std")]
/// Ensure that in Incomplete error is thrown, if too few bytes are passed for a given parser.
fn test_incomplete_bits() {
    let input = Partial::new(&[0x12][..]);

    // Take bit slices with sizes [4, 8].
    let result: ModalResult<(_, (u8, u8)), InputError<_>> =
        bits::<_, _, ErrMode<InputError<Bits<_>>>, _, _>((take(4usize), take(8usize)))
            .parse_peek(input);

    assert!(result.is_err());
    let error = result.err().unwrap();
    assert_eq!("Parsing requires 2 more data", error.to_string());
}

#[test]
fn test_take_complete_0() {
    let input = &[0b00010010][..];
    let count = 0usize;
    assert_eq!(count, 0usize);
    let offset = 0usize;

    let result: ModalResult<(Bits<&[u8]>, usize), InputError<_>> =
        take(count).parse_peek(Bits(input, offset));

    assert_eq!(result, Ok((Bits(input, offset), 0)));
}

#[test]
fn test_take_complete_eof() {
    let input = &[0b00010010][..];

    let result: ModalResult<(Bits<&[u8]>, usize), InputError<_>> =
        take(1usize).parse_peek(Bits(input, 8));

    assert_eq!(
        result,
        Err(crate::error::ErrMode::Backtrack(InputError::at(Bits(
            input, 8
        ),)))
    );
}

#[test]
fn test_take_complete_span_over_multiple_bytes() {
    let input = &[0b00010010, 0b00110100, 0b11111111, 0b11111111][..];

    let result: ModalResult<(Bits<&[u8]>, usize), InputError<_>> =
        take(24usize).parse_peek(Bits(input, 4));

    assert_eq!(
        result,
        Ok((Bits([0b11111111].as_ref(), 4), 0b1000110100111111111111))
    );
}

#[test]
fn test_take_partial_0() {
    let input = Partial::new(&[][..]);
    let count = 0usize;
    assert_eq!(count, 0usize);
    let offset = 0usize;

    let result: ModalResult<(Bits<_>, usize), InputError<_>> =
        take(count).parse_peek(Bits(input, offset));

    assert_eq!(result, Ok((Bits(input, offset), 0)));
}

#[test]
fn test_pattern_partial_ok() {
    let input = Partial::new(&[0b00011111][..]);
    let offset = 0usize;
    let bits_to_take = 4usize;
    let value_to_pattern = 0b0001;

    let result: ModalResult<(Bits<_>, usize), InputError<_>> =
        pattern(value_to_pattern, bits_to_take).parse_peek(Bits(input, offset));

    assert_eq!(result, Ok((Bits(input, bits_to_take), value_to_pattern)));
}

#[test]
fn test_pattern_partial_err() {
    let input = Partial::new(&[0b00011111][..]);
    let offset = 0usize;
    let bits_to_take = 4usize;
    let value_to_pattern = 0b1111;

    let result: ModalResult<(Bits<_>, usize), InputError<_>> =
        pattern(value_to_pattern, bits_to_take).parse_peek(Bits(input, offset));

    assert_eq!(
        result,
        Err(crate::error::ErrMode::Backtrack(InputError::at(Bits(
            input, offset
        ),)))
    );
}

#[test]
fn test_bool_0_complete() {
    let input = [0b10000000].as_ref();

    let result: ModalResult<(Bits<&[u8]>, bool), InputError<_>> = bool.parse_peek(Bits(input, 0));

    assert_eq!(result, Ok((Bits(input, 1), true)));
}

#[test]
fn test_bool_eof_complete() {
    let inp
```

---

# OUTRO - tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\stream\tests.rs
**SHA:** c46bfad4313ab416
**Timestamp:** 2026-08-28T02:37:41.170180
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = input.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg(feature = "parser")]

use crate::error::ErrMode;
use crate::error::ErrMode::Backtrack;
use crate::error::InputError;
use crate::token::literal;
use crate::{
    combinator::{separated, separated_pair},
    ModalResult, Parser,
};

use super::*;

#[cfg(feature = "std")]
#[test]
fn test_fxhashmap_compiles() {
    let input = "a=b";
    fn pair(i: &mut &str) -> ModalResult<(char, char)> {
        let out = separated_pair('a', '=', 'b').parse_next(i)?;
        Ok(out)
    }

    let _: rustc_hash::FxHashMap<char, char> = separated(0.., pair, ',').parse(input).unwrap();
}

#[test]
fn test_offset_u8() {
    let s = b"abcd123";
    let a = &s[..];
    let b = &a[2..];
    let c = &a[..4];
    let d = &a[3..5];
    assert_eq!(b.offset_from(&a), 2);
    assert_eq!(c.offset_from(&a), 0);
    assert_eq!(d.offset_from(&a), 3);
}

#[test]
fn test_offset_str() {
    let a = "abcřèÂßÇd123";
    let b = &a[7..];
    let c = &a[..5];
    let d = &a[5..9];
    assert_eq!(b.offset_from(&a), 7);
    assert_eq!(c.offset_from(&a), 0);
    assert_eq!(d.offset_from(&a), 5);
}

#[test]
fn test_partial_complete() {
    let mut i = Partial::new(&b""[..]);
    assert!(Partial::<&[u8]>::is_partial_supported());

    assert!(i.is_partial(), "incomplete by default");
    let incomplete_state = i.complete();
    assert!(!i.is_partial(), "the stream should be marked as complete");

    i.restore_partial(incomplete_state);
    assert!(i.is_partial(), "incomplete stream state should be restored");
}

#[test]
fn test_custom_slice() {
    type Token = usize;
    type TokenSlice<'i> = &'i [Token];

    let mut tokens: TokenSlice<'_> = &[1, 2, 3, 4];

    let input = &mut tokens;
    let start = input.checkpoint();
    let _ = input.next_token();
    let _ = input.next_token();
    let offset = input.offset_from(&start);
    assert_eq!(offset, 2);
}

#[test]
fn test_literal_support_char() {
    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>('π').parse_peek("π"),
        Ok(("", "π"))
    );
    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>('π').parse_peek("π3.14"),
        Ok(("3.14", "π"))
    );

    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>("π").parse_peek("π3.14"),
        Ok(("3.14", "π"))
    );

    assert_eq!(
        literal::<_, _, ErrMode<InputError<_>>>('-').parse_peek("π"),
        Err(Backtrack(InputError::at("π")))
    );

    assert_eq!(
        literal::<_, Partial<&[u8]>, ErrMode<InputError<_>>>('π')
            .parse_peek(Partial::new(b"\xCF\x80")),
        Ok((Partial::new(Default::default()), "π".as_bytes()))
    );
    assert_eq!(
        literal::<_, &[u8], ErrMode<InputError<_>>>('π').parse_peek(b"\xCF\x80"),
        Ok((Default::default(), "π".as_bytes()))
    );

    assert_eq!(
        literal::<_, Partial<&[u8]>, ErrMode<InputError<_>>>('π')
            .parse_peek(Partial::new(b"\xCF\x803.14")),
        Ok((Partial::new(&b"3.14"[..]), "π".as_bytes()))
    );
    assert_eq!(
        literal::<_, &[u8], ErrMode<InputError<_>>>('π').parse_peek(b"\xCF\x80"),
        Ok((Default::default(), "π".as_bytes()))
    );

    assert_eq!(
        literal::<_, &[u8], ErrMode<InputError<_>>>('π').parse_peek(b"\xCF\x803.14"),
        Ok((&b"3.14"[..], "π".as_bytes()))
    );

    assert_eq!(
        literal::<_, &[u8], ErrMode<InputError<_>>>('-').parse_peek(b"\xCF\x80"),
        Err(Backtrack(InputError::at(&b"\xCF\x80"[..],)))
    );
}

#[test]
fn tokenslice_location() {
    #[derive(Clone, Debug)]
    struct Token {
        span: core::ops::Range<usize>,
    }

    impl Location for Token {
        #[inline(always)]
        fn previous_token_end(&self) -> usize {
            self.span.end
        }
        #[inline(always)]
        fn current_token_start(&self) -> usize {
            self.span.start
        }
    }

    let input = [
        Token { span: 1..9 },
        Token { span: 11..19 },
        Token { span: 21..29 },
    ];
    let mut input = TokenSlice::new(&input);
    assert_eq!(input.previous_token_end(), 1);

    // Parse operation
    assert_eq!(input.current_token_start(), 1);
    let _ = input.next_token();
    assert_eq!(input.previous_token_end(), 9);

    // Parse operation
    assert_eq!(input.current_token_start(), 11);
    let _ = input.next_token();
    assert_eq!(input.previous_token_end(), 19);

    // Parse operation
    assert_eq!(input.current_token_start(), 21);
    let _ = input.next_token();
    assert_eq!(input.previous_token_end(), 29);

    assert_eq!(input.current_token_start(), 29);
}

```
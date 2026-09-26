# MISSAO - integration_tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-8.0.4\src\bin\integration_tests.rs
**SHA:** 9e78b3b692b99e2e
**Timestamp:** 2026-08-28T02:33:01.457282
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn elapsed(start: SystemTime) -> (Duration, bool) {
- fn elapsed(_start: Duration) -> (Duration, bool) {
- fn decompress_internal<InputType, OutputType, Run: Runner>(
- let start = now();
- fn benchmark_helper<Run: Runner>(

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg(test)]
#![allow(non_upper_case_globals)]
#![allow(dead_code)]

extern crate brotli_decompressor;
extern crate core;

use core::cmp::min;
use std::io;
#[cfg(feature = "std")]
use std::io::{Read, Write};
use std::time::Duration;
#[cfg(not(feature = "disable-timer"))]
use std::time::SystemTime;

use brotli::BrotliDecompressStream;

use super::alloc_no_stdlib::{Allocator, SliceWrapper, SliceWrapperMut};
use super::brotli::{BrotliResult, BrotliState};
#[cfg(feature = "std")]
use super::brotli::{CompressorReader, CompressorWriter};
#[cfg(feature = "std")]
use super::brotli_decompressor::{Decompressor, DecompressorWriter};
use super::{HeapAllocator, Rebox};

#[cfg(feature = "benchmark")]
extern crate test;
#[cfg(feature = "benchmark")]
use self::test::Bencher;

pub struct Buffer {
    data: Vec<u8>,
    read_offset: usize,
}

#[derive(Debug)]
pub struct UnlimitedBuffer {
    pub data: Vec<u8>,
    read_offset: usize,
}

#[cfg(feature = "disable-timer")]
fn now() -> Duration {
    return Duration::new(0, 0);
}
#[cfg(not(feature = "disable-timer"))]
fn now() -> SystemTime {
    SystemTime::now()
}

#[cfg(not(feature = "disable-timer"))]
fn elapsed(start: SystemTime) -> (Duration, bool) {
    match start.elapsed() {
        Ok(delta) => (delta, false),
        _ => (Duration::new(0, 0), true),
    }
}

#[cfg(feature = "disable-timer")]
fn elapsed(_start: Duration) -> (Duration, bool) {
    return (Duration::new(0, 0), true);
}

fn _write_all<OutputType>(w: &mut OutputType, buf: &[u8]) -> Result<(), io::Error>
where
    OutputType: io::Write,
{
    let mut total_written: usize = 0;
    while total_written < buf.len() {
        match w.write(&buf[total_written..]) {
            Err(e) => match e.kind() {
                io::ErrorKind::Interrupted => continue,
                _ => return Err(e),
            },
            Ok(cur_written) => {
                if cur_written == 0 {
                    return Err(io::Error::new(io::ErrorKind::UnexpectedEof, "Write EOF"));
                }
                total_written += cur_written;
            }
        }
    }
    Ok(())
}
trait Runner {
    fn iter<Fn: FnMut()>(&mut self, cb: &mut Fn);
}

struct Passthrough {}
impl Runner for Passthrough {
    fn iter<Fn: FnMut()>(&mut self, cb: &mut Fn) {
        cb()
    }
}

#[cfg(feature = "benchmark")]
struct BenchmarkPassthrough<'a>(pub &'a mut Bencher);
#[cfg(feature = "benchmark")]
impl<'a> Runner for BenchmarkPassthrough<'a> {
    fn iter<Fn: FnMut()>(&mut self, cb: &mut Fn) {
        self.0.iter(cb)
    }
}
// option_env!("BENCHMARK_MODE").is_some()

fn decompress_internal<InputType, OutputType, Run: Runner>(
    r: &mut InputType,
    mut w: &mut OutputType,
    input_buffer_limit: usize,
    output_buffer_limit: usize,
    runner: &mut Run,
) -> Result<(), io::Error>
where
    InputType: io::Read,
    OutputType: io::Write,
{
    let mut total = Duration::new(0, 0);
    let mut range: usize = 0;
    let mut timing_error: bool = false;
    runner.iter(&mut || {
        range += 1;
        let mut brotli_state = BrotliState::new(
            HeapAllocator::default(),
            HeapAllocator::default(),
            HeapAllocator::default(),
        );
        let mut input = brotli_state.alloc_u8.alloc_cell(input_buffer_limit);
        let mut output = brotli_state.alloc_u8.alloc_cell(output_buffer_limit);
        let mut available_out: usize = output.slice().len();

        // let amount = try!(r.read(&mut buf));
        let mut available_in: usize = 0;
        let mut input_offset: usize = 0;
        let mut output_offset: usize = 0;
        let mut result: BrotliResult = BrotliResult::NeedsMoreInput;
        loop {
            match result {
                BrotliResult::NeedsMoreInput => {
                    input_offset = 0;
                    match r.read(input.slice_mut()) {
                        Err(e) => match e.kind() {
                            io::ErrorKind::Interrupted => continue,
                            _ => panic!("{}", e),
                        },
                        Ok(size) => {
                            if size == 0 {
                                panic!(
                                    "{:?}",
                                    io::Error::new(io::ErrorKind::UnexpectedEof, "Read EOF")
                                );
                            }
                            available_in = size;
                        }
                    }
                }
                BrotliResult::NeedsMoreOutput => {
                    _write_all(&mut w, &output.slice()[..output_offset]).unwrap();
                    output_offset = 0;
                }
                BrotliResult::ResultSuccess => break,
                BrotliResult::ResultFailure => panic!("FAILURE"),
            }
            let mut written: usize = 0;
            let start = now();
            result = BrotliDecompressStream(
                &mut available_in,
                &mut input_offset,
          
```
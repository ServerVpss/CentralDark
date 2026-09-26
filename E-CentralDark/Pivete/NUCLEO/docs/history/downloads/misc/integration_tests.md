# OUTRO - integration_tests.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-decompressor-5.0.3\src\bin\integration_tests.rs
**SHA:** 849b190df5f9089a
**Timestamp:** 2026-08-28T02:33:06.335156
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn elapsed(start: SystemTime) -> (Duration, bool) {
- fn elapsed(_start: Duration) -> (Duration, bool) {
- let start = now();

### Gaps
- rep_gap: usize,

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg(test)]
extern crate core;
use std::io;
#[cfg(feature="std")]
use std::io::{Read,Write};
use core::cmp;
use super::brotli_decompressor::BrotliResult;
use super::brotli_decompressor::BrotliDecompressStream;
#[cfg(feature="std")]
use super::brotli_decompressor::{Decompressor, DecompressorWriter};
use super::brotli_decompressor::BrotliState;
use super::brotli_decompressor::HuffmanCode;
use super::HeapAllocator;

#[allow(unused_imports)]
use super::alloc_no_stdlib::{Allocator, SliceWrapper, SliceWrapperMut};
use std::time::Duration;
#[cfg(not(feature="disable-timer"))]
use std::time::SystemTime;

struct Buffer {
  data: Vec<u8>,
  read_offset: usize,
}
#[cfg(feature="std")]
struct UnlimitedBuffer {
  data: Vec<u8>,
  read_offset: usize,
}

#[cfg(feature="std")]
impl UnlimitedBuffer {
  pub fn new(buf: &[u8]) -> Self {
    let mut ret = UnlimitedBuffer {
      data: Vec::<u8>::new(),
      read_offset: 0,
    };
    ret.data.extend(buf);
    return ret;
  }
}

#[cfg(feature="std")]
impl io::Read for UnlimitedBuffer {
  fn read(self: &mut Self, buf: &mut [u8]) -> io::Result<usize> {
    let bytes_to_read = cmp::min(buf.len(), self.data.len() - self.read_offset);
    if bytes_to_read > 0 {
      buf[0..bytes_to_read].clone_from_slice(&self.data[self.read_offset..
                                              self.read_offset + bytes_to_read]);
    }
    self.read_offset += bytes_to_read;
    return Ok(bytes_to_read);
  }
}

#[cfg(feature="std")]
impl io::Write for UnlimitedBuffer {
  fn write(self: &mut Self, buf: &[u8]) -> io::Result<usize> {
    self.data.extend(buf);
    return Ok(buf.len());
  }
  fn flush(self: &mut Self) -> io::Result<()> {
    return Ok(());
  }
}


#[cfg(feature="disable-timer")]
fn now() -> Duration {
  return Duration::new(0, 0);
}
#[cfg(not(feature="disable-timer"))]
fn now() -> SystemTime {
  return SystemTime::now();
}

#[cfg(not(feature="disable-timer"))]
fn elapsed(start: SystemTime) -> (Duration, bool) {
  match start.elapsed() {
    Ok(delta) => return (delta, false),
    _ => return (Duration::new(0, 0), true),
  }
}

#[cfg(feature="disable-timer")]
fn elapsed(_start: Duration) -> (Duration, bool) {
  return (Duration::new(0, 0), true);
}


fn _write_all<OutputType>(w: &mut OutputType, buf: &[u8]) -> Result<(), io::Error>
  where OutputType: io::Write
{
  let mut total_written: usize = 0;
  while total_written < buf.len() {
    match w.write(&buf[total_written..]) {
      Err(e) => {
        match e.kind() {
          io::ErrorKind::Interrupted => continue,
          _ => return Err(e),
        }
      }
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


#[cfg(feature="benchmark")]
const NUM_BENCHMARK_ITERATIONS: usize = 1000;
#[cfg(not(feature="benchmark"))]
const NUM_BENCHMARK_ITERATIONS: usize = 2;

// option_env!("BENCHMARK_MODE").is_some()

pub fn decompress_internal<InputType, OutputType>(r: &mut InputType,
                                                  mut w: &mut OutputType,
                                                  input_buffer_limit: usize,
                                                  output_buffer_limit: usize,
                                                  benchmark_mode: bool)
                                                  -> Result<(), io::Error>
  where InputType: io::Read,
        OutputType: io::Write
{
  let mut total = Duration::new(0, 0);
  let range: usize;
  let mut timing_error: bool = false;
  if benchmark_mode {
    range = NUM_BENCHMARK_ITERATIONS;
  } else {
    range = 1;
  }
  for _i in 0..range {
    let mut brotli_state =
      BrotliState::new(HeapAllocator::<u8> { default_value: 0 },
                       HeapAllocator::<u32> { default_value: 0 },
                       HeapAllocator::<HuffmanCode> { default_value: HuffmanCode::default() });
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
            Err(e) => {
              match e.kind() {
                io::ErrorKind::Interrupted => continue,
                _ => return Err(e),
              }
            }
            Ok(size) => {
              if size == 0 {
                return Err(io::Error::new(io::ErrorKind::UnexpectedEof, "Read EOF"));
              }
              available_in = size;
            }
          }
        }
        BrotliResult::NeedsMoreOutput => {
           
```
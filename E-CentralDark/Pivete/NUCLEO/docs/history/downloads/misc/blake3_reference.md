# OUTRO - blake3_reference.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-codegen-2.6.3\src\vendor\blake3_reference.rs
**SHA:** a277f124d3ff7718
**Timestamp:** 2026-08-28T02:35:55.791746
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const CHUNK_START: u32 = 1 << 0;

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! This is a lightly modified version of the BLAKE3 reference implementation.
//!
//! The changes applied are to remove unused item warnings due to using it
//! vendored along with some minor clippy suggestions. No logic changes. I
//! suggest diffing against the original to find all the changes.
//!
//! ## Original Header
//! This is the reference implementation of BLAKE3. It is used for testing and
//! as a readable example of the algorithms involved. Section 5.1 of [the BLAKE3
//! spec](https://github.com/BLAKE3-team/BLAKE3-specs/blob/master/blake3.pdf)
//! discusses this implementation. You can render docs for this implementation
//! by running `cargo doc --open` in this directory.
//!
//! # Example
//!
//! ```
//! let mut hasher = tauri_codegen::vendor::blake3_reference::Hasher::new();
//! hasher.update(b"abc");
//! hasher.update(b"def");
//! let mut hash = [0; 32];
//! hasher.finalize(&mut hash);
//! let mut extended_hash = [0; 500];
//! hasher.finalize(&mut extended_hash);
//! assert_eq!(hash, extended_hash[..32]);
//! ```
//!
//! CC0-1.0 OR Apache-2.0

use core::cmp::min;
use core::convert::TryInto;

const OUT_LEN: usize = 32;
const BLOCK_LEN: usize = 64;
const CHUNK_LEN: usize = 1024;

const CHUNK_START: u32 = 1 << 0;
const CHUNK_END: u32 = 1 << 1;
const PARENT: u32 = 1 << 2;
const ROOT: u32 = 1 << 3;

const IV: [u32; 8] = [
  0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19,
];

const MSG_PERMUTATION: [usize; 16] = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];

// The mixing function, G, which mixes either a column or a diagonal.
fn g(state: &mut [u32; 16], a: usize, b: usize, c: usize, d: usize, mx: u32, my: u32) {
  state[a] = state[a].wrapping_add(state[b]).wrapping_add(mx);
  state[d] = (state[d] ^ state[a]).rotate_right(16);
  state[c] = state[c].wrapping_add(state[d]);
  state[b] = (state[b] ^ state[c]).rotate_right(12);
  state[a] = state[a].wrapping_add(state[b]).wrapping_add(my);
  state[d] = (state[d] ^ state[a]).rotate_right(8);
  state[c] = state[c].wrapping_add(state[d]);
  state[b] = (state[b] ^ state[c]).rotate_right(7);
}

fn round(state: &mut [u32; 16], m: &[u32; 16]) {
  // Mix the columns.
  g(state, 0, 4, 8, 12, m[0], m[1]);
  g(state, 1, 5, 9, 13, m[2], m[3]);
  g(state, 2, 6, 10, 14, m[4], m[5]);
  g(state, 3, 7, 11, 15, m[6], m[7]);
  // Mix the diagonals.
  g(state, 0, 5, 10, 15, m[8], m[9]);
  g(state, 1, 6, 11, 12, m[10], m[11]);
  g(state, 2, 7, 8, 13, m[12], m[13]);
  g(state, 3, 4, 9, 14, m[14], m[15]);
}

fn permute(m: &mut [u32; 16]) {
  let mut permuted = [0; 16];
  for i in 0..16 {
    permuted[i] = m[MSG_PERMUTATION[i]];
  }
  *m = permuted;
}

fn compress(
  chaining_value: &[u32; 8],
  block_words: &[u32; 16],
  counter: u64,
  block_len: u32,
  flags: u32,
) -> [u32; 16] {
  let mut state = [
    chaining_value[0],
    chaining_value[1],
    chaining_value[2],
    chaining_value[3],
    chaining_value[4],
    chaining_value[5],
    chaining_value[6],
    chaining_value[7],
    IV[0],
    IV[1],
    IV[2],
    IV[3],
    counter as u32,
    (counter >> 32) as u32,
    block_len,
    flags,
  ];
  let mut block = *block_words;

  round(&mut state, &block); // round 1
  permute(&mut block);
  round(&mut state, &block); // round 2
  permute(&mut block);
  round(&mut state, &block); // round 3
  permute(&mut block);
  round(&mut state, &block); // round 4
  permute(&mut block);
  round(&mut state, &block); // round 5
  permute(&mut block);
  round(&mut state, &block); // round 6
  permute(&mut block);
  round(&mut state, &block); // round 7

  for i in 0..8 {
    state[i] ^= state[i + 8];
    state[i + 8] ^= chaining_value[i];
  }
  state
}

fn first_8_words(compression_output: [u32; 16]) -> [u32; 8] {
  compression_output[0..8].try_into().unwrap()
}

fn words_from_little_endian_bytes(bytes: &[u8], words: &mut [u32]) {
  debug_assert_eq!(bytes.len(), 4 * words.len());
  for (four_bytes, word) in bytes.chunks_exact(4).zip(words) {
    *word = u32::from_le_bytes(four_bytes.try_into().unwrap());
  }
}

// Each chunk or parent node can produce either an 8-word chaining value or, by
// setting the ROOT flag, any number of final output bytes. The Output struct
// captures the state just prior to choosing between those two possibilities.
struct Output {
  input_chaining_value: [u32; 8],
  block_words: [u32; 16],
  counter: u64,
  block_len: u32,
  flags: u32,
}

impl Output {
  fn chaining_value(&self) -> [u32; 8] {
    first_8_words(compress(
      &self.input_chaining_value,
      &self.block_words,
      self.counter,
      self.block_len,
      self.flags,
    ))
  }

  fn root_output_bytes(&self, out_slice: &mut [u8]) {
    for (output_block_counter, out_block) in (0u64..).zip(out_slice.chunks_mut(2 * OUT_LEN)) {
      let words = compress(
        &self.input_chaining_val
```
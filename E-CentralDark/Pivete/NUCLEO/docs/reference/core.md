# REFERENCIA - core.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\miniz_oxide-0.8.9\src\inflate\core.rs
**SHA:** 59611659879c2b2b
**Timestamp:** 2026-08-28T02:34:49.719621
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Start = 0,
- Start => generate_state!(state, 'state_machine, {
- let dist_table_start = r.table_sizes[LITLEN_TABLE] as usize;
- let dist_table_start = dist_table_start & LEN_CODES_MASK;
- let fill_start = l.counter as usize;

### Gaps
- /// TODO: Check if a smaller type for code_len helps performance.
- // TODO:(oyvindln) Check that copies here are optimized out in release mode.
- // TODO: Need to verify that this is faster on all platforms.
- // TODO: Is there any point to check for code_len != 0 here still?
- // TODO: miniz jumps straight to here after getting here again after failing to read
- // TODO: `l: &mut LocalVars` may be slow similar to decompress_fast (even with inline(always))
- // TODO: Avoid creating this table at all.
- // TODO: An invalid before start of data wrapping match reached here before
- // TODO: Changed this to jump to `RawReadfirstbyte` rather than
- // TODO: May want to see if we can do this in a better way.

### Ouro Bruto (primeiros 5000 chars)
```
//! Streaming decompression functionality.

use super::*;
use crate::shared::{update_adler32, HUFFMAN_LENGTH_ORDER};
use ::core::cell::Cell;

use ::core::cmp;
use ::core::convert::TryInto;

use self::output_buffer::{InputWrapper, OutputBuffer};

#[cfg(feature = "serde")]
use crate::serde::big_array::BigArray;
#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

pub const TINFL_LZ_DICT_SIZE: usize = 32_768;

/// A struct containing huffman code lengths and the huffman code tree used by the decompressor.
#[cfg_attr(not(feature = "rustc-dep-of-std"), derive(Clone))]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
struct HuffmanTable {
    /// Fast lookup table for shorter huffman codes.
    ///
    /// See `HuffmanTable::fast_lookup`.
    #[cfg_attr(feature = "serde", serde(with = "BigArray"))]
    pub look_up: [i16; FAST_LOOKUP_SIZE as usize],
    /// Full huffman tree.
    ///
    /// Positive values are edge nodes/symbols, negative values are
    /// parent nodes/references to other nodes.
    #[cfg_attr(feature = "serde", serde(with = "BigArray"))]
    pub tree: [i16; MAX_HUFF_TREE_SIZE],
}

impl HuffmanTable {
    const fn new() -> HuffmanTable {
        HuffmanTable {
            look_up: [0; FAST_LOOKUP_SIZE as usize],
            tree: [0; MAX_HUFF_TREE_SIZE],
        }
    }

    /// Look for a symbol in the fast lookup table.
    /// The symbol is stored in the lower 9 bits, the length in the next 6.
    /// If the returned value is negative, the code wasn't found in the
    /// fast lookup table and the full tree has to be traversed to find the code.
    #[inline]
    fn fast_lookup(&self, bit_buf: BitBuffer) -> i16 {
        self.look_up[(bit_buf & BitBuffer::from(FAST_LOOKUP_SIZE - 1)) as usize]
    }

    /// Get the symbol and the code length from the huffman tree.
    #[inline]
    fn tree_lookup(&self, fast_symbol: i32, bit_buf: BitBuffer, mut code_len: u8) -> (i32, u32) {
        let mut symbol = fast_symbol;
        // We step through the tree until we encounter a positive value, which indicates a
        // symbol.
        loop {
            // symbol here indicates the position of the left (0) node, if the next bit is 1
            // we add 1 to the lookup position to get the right node.
            let tree_index = (!symbol + ((bit_buf >> code_len) & 1) as i32) as usize;

            // Use get here to avoid generatic panic code.
            // The init_tree code should prevent this from actually going out of bounds
            // but if there were somehow a bug with that
            // we would at worst end up with corrupted output in release mode.
            debug_assert!(tree_index < self.tree.len());
            symbol = i32::from(self.tree.get(tree_index).copied().unwrap_or(i16::MAX));
            code_len += 1;
            if symbol >= 0 {
                break;
            }
        }
        // Note: Using a u8 for code_len inside this function seems to improve performance, but changing it
        // in localvars seems to worsen things so we convert it to a u32 here.
        (symbol, u32::from(code_len))
    }

    #[inline]
    /// Look up a symbol and code length from the bits in the provided bit buffer.
    ///
    /// Returns Some(symbol, length) on success,
    /// None if the length is 0.
    ///
    /// It's possible we could avoid checking for 0 if we can guarantee a sane table.
    /// TODO: Check if a smaller type for code_len helps performance.
    fn lookup(&self, bit_buf: BitBuffer) -> (i32, u32) {
        let symbol = self.fast_lookup(bit_buf).into();
        if symbol >= 0 {
            let length = (symbol >> 9) as u32;
            (symbol, length)
        } else {
            // We didn't get a symbol from the fast lookup table, so check the tree instead.
            self.tree_lookup(symbol, bit_buf, FAST_LOOKUP_BITS)
        }
    }
}

/// The number of huffman tables used.
const MAX_HUFF_TABLES: usize = 3;
/// The length of the first (literal/length) huffman table.
const MAX_HUFF_SYMBOLS_0: usize = 288;
/// The length of the second (distance) huffman table.
const MAX_HUFF_SYMBOLS_1: usize = 32;
/// The length of the last (huffman code length) huffman table.
const MAX_HUFF_SYMBOLS_2: usize = 19;
/// The maximum length of a code that can be looked up in the fast lookup table.
const FAST_LOOKUP_BITS: u8 = 10;
/// The size of the fast lookup table.
const FAST_LOOKUP_SIZE: u16 = 1 << FAST_LOOKUP_BITS;
const MAX_HUFF_TREE_SIZE: usize = MAX_HUFF_SYMBOLS_0 * 2;
const LITLEN_TABLE: usize = 0;
const DIST_TABLE: usize = 1;
const HUFFLEN_TABLE: usize = 2;
const LEN_CODES_SIZE: usize = 512;
const LEN_CODES_MASK: usize = LEN_CODES_SIZE - 1;

/// Flags to [`decompress()`] to control how inflation works.
///
/// These define bits for a bitmask argument.
pub mod inflate_flags {
    /// Should we try to parse a zlib header?
    ///
    /// If unset, the function will expect an RFC1951 deflate stream.  If set, it will expect a
    /// RFC1950 zlib wrapp
```

---

# REFERENCIA - core.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\task\core.rs
**SHA:** 7c896dec6ef10054
**Timestamp:** 2026-08-28T02:36:18.710183
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: replace with `#[expect(unsafe_op_in_unsafe_fn)]` after bumpping
- #[cfg_attr(not(tokio_unstable), allow(dead_code))] //TODO: remove when hooks are stabilized

### Ouro Bruto (primeiros 5000 chars)
```
//! Core task module.
//!
//! # Safety
//!
//! The functions in this module are private to the `task` module. All of them
//! should be considered `unsafe` to use, but are not marked as such since it
//! would be too noisy.
//!
//! Make sure to consult the relevant safety section of each function before
//! use.

// It doesn't make sense to enforce `unsafe_op_in_unsafe_fn` for this module because
//
// * This module is doing the low-level task management that requires tons of unsafe
//   operations.
// * Excessive `unsafe {}` blocks hurt readability significantly.
// TODO: replace with `#[expect(unsafe_op_in_unsafe_fn)]` after bumpping
// the MSRV to 1.81.0.
#![allow(unsafe_op_in_unsafe_fn)]

use crate::future::Future;
use crate::loom::cell::UnsafeCell;
use crate::runtime::context;
use crate::runtime::metrics::ScheduleLatencyInstant;
use crate::runtime::task::raw::{self, Vtable};
use crate::runtime::task::state::State;
use crate::runtime::task::{Id, Schedule, TaskHarnessScheduleHooks};
use crate::util::linked_list;

use std::num::NonZeroU64;
#[cfg(tokio_unstable)]
use std::panic::Location;
use std::pin::Pin;
use std::ptr::NonNull;
use std::task::{Context, Poll, Waker};

/// The task cell. Contains the components of the task.
///
/// It is critical for `Header` to be the first field as the task structure will
/// be referenced by both *mut Cell and *mut Header.
///
/// Any changes to the layout of this struct _must_ also be reflected in the
/// `const` fns in raw.rs.
///
// # This struct should be cache padded to avoid false sharing. The cache padding rules are copied
// from crossbeam-utils/src/cache_padded.rs
//
// Starting from Intel's Sandy Bridge, spatial prefetcher is now pulling pairs of 64-byte cache
// lines at a time, so we have to align to 128 bytes rather than 64.
//
// Sources:
// - https://www.intel.com/content/dam/www/public/us/en/documents/manuals/64-ia-32-architectures-optimization-manual.pdf
// - https://github.com/facebook/folly/blob/1b5288e6eea6df074758f877c849b6e73bbb9fbb/folly/lang/Align.h#L107
//
// ARM's big.LITTLE architecture has asymmetric cores and "big" cores have 128-byte cache line size.
//
// Sources:
// - https://www.mono-project.com/news/2016/09/12/arm64-icache/
//
// powerpc64 has 128-byte cache line size.
//
// Sources:
// - https://github.com/golang/go/blob/3dd58676054223962cd915bb0934d1f9f489d4d2/src/internal/cpu/cpu_ppc64x.go#L9
#[cfg_attr(
    any(
        target_arch = "x86_64",
        target_arch = "aarch64",
        target_arch = "powerpc64",
    ),
    repr(align(128))
)]
// arm, mips, mips64, sparc, and hexagon have 32-byte cache line size.
//
// Sources:
// - https://github.com/golang/go/blob/3dd58676054223962cd915bb0934d1f9f489d4d2/src/internal/cpu/cpu_arm.go#L7
// - https://github.com/golang/go/blob/3dd58676054223962cd915bb0934d1f9f489d4d2/src/internal/cpu/cpu_mips.go#L7
// - https://github.com/golang/go/blob/3dd58676054223962cd915bb0934d1f9f489d4d2/src/internal/cpu/cpu_mipsle.go#L7
// - https://github.com/golang/go/blob/3dd58676054223962cd915bb0934d1f9f489d4d2/src/internal/cpu/cpu_mips64x.go#L9
// - https://github.com/torvalds/linux/blob/3516bd729358a2a9b090c1905bd2a3fa926e24c6/arch/sparc/include/asm/cache.h#L17
// - https://github.com/torvalds/linux/blob/3516bd729358a2a9b090c1905bd2a3fa926e24c6/arch/hexagon/include/asm/cache.h#L12
#[cfg_attr(
    any(
        target_arch = "arm",
        target_arch = "mips",
        target_arch = "mips64",
        target_arch = "sparc",
        target_arch = "hexagon",
    ),
    repr(align(32))
)]
// m68k has 16-byte cache line size.
//
// Sources:
// - https://github.com/torvalds/linux/blob/3516bd729358a2a9b090c1905bd2a3fa926e24c6/arch/m68k/include/asm/cache.h#L9
#[cfg_attr(target_arch = "m68k", repr(align(16)))]
// s390x has 256-byte cache line size.
//
// Sources:
// - https://github.com/golang/go/blob/3dd58676054223962cd915bb0934d1f9f489d4d2/src/internal/cpu/cpu_s390x.go#L7
// - https://github.com/torvalds/linux/blob/3516bd729358a2a9b090c1905bd2a3fa926e24c6/arch/s390/include/asm/cache.h#L13
#[cfg_attr(target_arch = "s390x", repr(align(256)))]
// x86, riscv, wasm, and sparc64 have 64-byte cache line size.
//
// Sources:
// - https://github.com/golang/go/blob/dda2991c2ea0c5914714469c4defc2562a907230/src/internal/cpu/cpu_x86.go#L9
// - https://github.com/golang/go/blob/3dd58676054223962cd915bb0934d1f9f489d4d2/src/internal/cpu/cpu_wasm.go#L7
// - https://github.com/torvalds/linux/blob/3516bd729358a2a9b090c1905bd2a3fa926e24c6/arch/sparc/include/asm/cache.h#L19
// - https://github.com/torvalds/linux/blob/3516bd729358a2a9b090c1905bd2a3fa926e24c6/arch/riscv/include/asm/cache.h#L10
//
// All others are assumed to have 64-byte cache line size.
#[cfg_attr(
    not(any(
        target_arch = "x86_64",
        target_arch = "aarch64",
        target_arch = "powerpc64",
        target_arch = "arm",
        target_arch = "mips",
        target_arch = "mips64",
        target_arch = "sparc",
        target_arch = "hexagon",
        ta
```
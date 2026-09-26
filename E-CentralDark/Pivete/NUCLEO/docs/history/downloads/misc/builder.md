# OUTRO - builder.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\packed\teddy\builder.rs
**SHA:** 08ec116a4a842a2b
**Timestamp:** 2026-08-28T02:32:19.643258
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = teddym.start().as_usize().wrapping_sub(hayptr.as_usize());
- unsafe fn find(&self, start: *const u8, end: *const u8) -> Option<Match>;
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,

### Padroes
- use crate::packed::{ext::Pointer, pattern::Patterns, teddy::generic::Match};
- pattern::Patterns,
- pattern::Patterns,

### Ouro Bruto (primeiros 5000 chars)
```
use core::{
    fmt::Debug,
    panic::{RefUnwindSafe, UnwindSafe},
};

use alloc::sync::Arc;

use crate::packed::{ext::Pointer, pattern::Patterns, teddy::generic::Match};

/// A builder for constructing a Teddy matcher.
///
/// The builder primarily permits fine grained configuration of the Teddy
/// matcher. Most options are made only available for testing/benchmarking
/// purposes. In reality, options are automatically determined by the nature
/// and number of patterns given to the builder.
#[derive(Clone, Debug)]
pub(crate) struct Builder {
    /// When none, this is automatically determined. Otherwise, `false` means
    /// slim Teddy is used (8 buckets) and `true` means fat Teddy is used
    /// (16 buckets). Fat Teddy requires AVX2, so if that CPU feature isn't
    /// available and Fat Teddy was requested, no matcher will be built.
    only_fat: Option<bool>,
    /// When none, this is automatically determined. Otherwise, `false` means
    /// that 128-bit vectors will be used (up to SSSE3 instructions) where as
    /// `true` means that 256-bit vectors will be used. As with `fat`, if
    /// 256-bit vectors are requested and they aren't available, then a
    /// searcher will not be built.
    only_256bit: Option<bool>,
    /// When true (the default), the number of patterns will be used as a
    /// heuristic for refusing construction of a Teddy searcher. The point here
    /// is that too many patterns can overwhelm Teddy. But this can be disabled
    /// in cases where the caller knows better.
    heuristic_pattern_limits: bool,
}

impl Default for Builder {
    fn default() -> Builder {
        Builder::new()
    }
}

impl Builder {
    /// Create a new builder for configuring a Teddy matcher.
    pub(crate) fn new() -> Builder {
        Builder {
            only_fat: None,
            only_256bit: None,
            heuristic_pattern_limits: true,
        }
    }

    /// Build a matcher for the set of patterns given. If a matcher could not
    /// be built, then `None` is returned.
    ///
    /// Generally, a matcher isn't built if the necessary CPU features aren't
    /// available, an unsupported target or if the searcher is believed to be
    /// slower than standard techniques (i.e., if there are too many literals).
    pub(crate) fn build(&self, patterns: Arc<Patterns>) -> Option<Searcher> {
        self.build_imp(patterns)
    }

    /// Require the use of Fat (true) or Slim (false) Teddy. Fat Teddy uses
    /// 16 buckets where as Slim Teddy uses 8 buckets. More buckets are useful
    /// for a larger set of literals.
    ///
    /// `None` is the default, which results in an automatic selection based
    /// on the number of literals and available CPU features.
    pub(crate) fn only_fat(&mut self, yes: Option<bool>) -> &mut Builder {
        self.only_fat = yes;
        self
    }

    /// Request the use of 256-bit vectors (true) or 128-bit vectors (false).
    /// Generally, a larger vector size is better since it either permits
    /// matching more patterns or matching more bytes in the haystack at once.
    ///
    /// `None` is the default, which results in an automatic selection based on
    /// the number of literals and available CPU features.
    pub(crate) fn only_256bit(&mut self, yes: Option<bool>) -> &mut Builder {
        self.only_256bit = yes;
        self
    }

    /// Request that heuristic limitations on the number of patterns be
    /// employed. This useful to disable for benchmarking where one wants to
    /// explore how Teddy performs on large number of patterns even if the
    /// heuristics would otherwise refuse construction.
    ///
    /// This is enabled by default.
    pub(crate) fn heuristic_pattern_limits(
        &mut self,
        yes: bool,
    ) -> &mut Builder {
        self.heuristic_pattern_limits = yes;
        self
    }

    fn build_imp(&self, patterns: Arc<Patterns>) -> Option<Searcher> {
        let patlimit = self.heuristic_pattern_limits;
        // There's no particular reason why we limit ourselves to little endian
        // here, but it seems likely that some parts of Teddy as they are
        // currently written (e.g., the uses of `trailing_zeros`) are likely
        // wrong on non-little-endian targets. Such things are likely easy to
        // fix, but at the time of writing (2023/09/18), I actually do not know
        // how to test this code on a big-endian target. So for now, we're
        // conservative and just bail out.
        if !cfg!(target_endian = "little") {
            debug!("skipping Teddy because target isn't little endian");
            return None;
        }
        // Too many patterns will overwhelm Teddy and likely lead to slow
        // downs, typically in the verification step.
        if patlimit && patterns.len() > 64 {
            debug!("skipping Teddy because of too many patterns");
            return None;
        }

        #[cfg(all(target_arch = "x86_64", target_feature = "sse2"))]
        
```

---

# OUTRO - builder.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_collections-2.2.0\src\codepointinvlist\builder.rs
**SHA:** 0ffd2612dbd6aa85
**Timestamp:** 2026-08-28T02:34:18.339022
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn add_remove_middle(&mut self, start: u32, end: u32, add: bool) {
- fn add(&mut self, start: u32, end: u32) {
- fn remove(&mut self, start: u32, end: u32) {
- let range_start = u32::from(PotentialCodePoint::from_unaligned(pair[0]));

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use alloc::vec;
use alloc::vec::Vec;
use core::{char, cmp::Ordering, ops::RangeBounds};
use potential_utf::PotentialCodePoint;

use crate::codepointinvlist::{utils::deconstruct_range, CodePointInversionList};
use zerovec::{ule::AsULE, ZeroVec};

/// A builder for [`CodePointInversionList`].
///
/// Provides exposure to builder functions and conversion to [`CodePointInversionList`]
#[derive(Default, Clone, Debug)]
pub struct CodePointInversionListBuilder {
    // A sorted list of even length, with values <= char::MAX + 1
    intervals: Vec<u32>,
}

impl CodePointInversionListBuilder {
    /// Returns empty [`CodePointInversionListBuilder`]
    pub const fn new() -> Self {
        Self { intervals: vec![] }
    }

    /// Returns a [`CodePointInversionList`] and consumes the [`CodePointInversionListBuilder`]
    pub fn build(self) -> CodePointInversionList<'static> {
        let inv_list: ZeroVec<PotentialCodePoint> = self
            .intervals
            .into_iter()
            .map(PotentialCodePoint::from_u24)
            .collect();
        #[expect(clippy::unwrap_used)] // by invariant
        CodePointInversionList::try_from_inversion_list(inv_list).unwrap()
    }

    /// Abstraction for adding/removing a range from start..end
    ///
    /// If add is true add, else remove
    fn add_remove_middle(&mut self, start: u32, end: u32, add: bool) {
        if start >= end || end > char::MAX as u32 + 1 {
            return;
        }
        let start_res = self.intervals.binary_search(&start);
        let end_res = self.intervals.binary_search(&end);
        let mut start_ind = start_res.unwrap_or_else(|x| x);
        let mut end_ind = end_res.unwrap_or_else(|x| x);
        let start_pos_check = (start_ind % 2 == 0) == add;
        let end_pos_check = (end_ind % 2 == 0) == add;
        let start_eq_end = start_ind == end_ind;

        #[expect(clippy::indexing_slicing)] // all indices are binary search results
        if start_eq_end && start_pos_check && end_res.is_err() {
            self.intervals.splice(start_ind..end_ind, [start, end]);
        } else {
            if start_pos_check {
                self.intervals[start_ind] = start;
                start_ind += 1;
            }
            if end_pos_check {
                if end_res.is_ok() {
                    end_ind += 1;
                } else {
                    end_ind -= 1;
                    self.intervals[end_ind] = end;
                }
            }
            if start_ind < end_ind {
                self.intervals.drain(start_ind..end_ind);
            }
        }
    }

    /// Add the range to the [`CodePointInversionListBuilder`]
    ///
    /// Accomplishes this through binary search for the start and end indices and merges intervals
    /// in between with inplace memory. Performs `O(1)` operation if adding to end of list, and `O(N)` otherwise,
    /// where `N` is the number of endpoints.
    fn add(&mut self, start: u32, end: u32) {
        if start >= end {
            return;
        }
        if self.intervals.is_empty() {
            self.intervals.extend_from_slice(&[start, end]);
            return;
        }
        self.add_remove_middle(start, end, true);
    }

    /// Add the character to the [`CodePointInversionListBuilder`]
    ///
    /// # Examples
    ///
    /// ```
    /// use icu::collections::codepointinvlist::CodePointInversionListBuilder;
    /// let mut builder = CodePointInversionListBuilder::new();
    /// builder.add_char('a');
    /// let check = builder.build();
    /// assert_eq!(check.iter_chars().next(), Some('a'));
    /// ```
    pub fn add_char(&mut self, c: char) {
        let to_add = c as u32;
        self.add(to_add, to_add + 1);
    }

    /// Add the code point value to the [`CodePointInversionListBuilder`]
    ///
    /// Note: Even though [`u32`] and [`prim@char`] in Rust are non-negative 4-byte
    /// values, there is an important difference. A [`u32`] can take values up to
    /// a very large integer value, while a [`prim@char`] in Rust is defined to be in
    /// the range from 0 to the maximum valid Unicode Scalar Value.
    ///
    /// # Examples
    ///
    /// ```
    /// use icu::collections::codepointinvlist::CodePointInversionListBuilder;
    /// let mut builder = CodePointInversionListBuilder::new();
    /// builder.add32(0x41);
    /// let check = builder.build();
    /// assert!(check.contains32(0x41));
    /// ```
    pub fn add32(&mut self, c: u32) {
        if c <= char::MAX as u32 {
            // we already know 0 <= c  because c: u32
            self.add(c, c + 1);
        }
    }

    /// Add the range of characters to the [`CodePointInversionListBuilder`]
    ///
    /// # Examples
    ///
    /// ```
    /// use icu::collections::codepointinvlist::CodePoin
```

---

# OUTRO - builder.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\nfa\thompson\builder.rs
**SHA:** 7adf6aba69171f6a
**Timestamp:** 2026-08-28T02:35:06.210323
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// let start = builder.add_capture_start(StateID::ZERO, 0, None)?;
- ///     start: b'a', end: b'z', next: StateID::ZERO,
- /// let start = builder.add_capture_start(StateID::ZERO, 0, None)?;
- ///     start: b'\x00', end: b'\xFF', next: StateID::ZERO,
- ///     start: b'a', end: b'z', next: StateID::ZERO,
- ///     start: b'A', end: b'Z', next: StateID::ZERO,

### Padroes
- start_pattern: Vec<StateID>,

### Ouro Bruto (primeiros 5000 chars)
```
use core::mem;

use alloc::{sync::Arc, vec, vec::Vec};

use crate::{
    nfa::thompson::{
        error::BuildError,
        nfa::{self, SparseTransitions, Transition, NFA},
    },
    util::{
        look::{Look, LookMatcher},
        primitives::{IteratorIndexExt, PatternID, SmallIndex, StateID},
    },
};

/// An intermediate NFA state used during construction.
///
/// During construction of an NFA, it is often convenient to work with states
/// that are amenable to mutation and other carry more information than we
/// otherwise need once an NFA has been built. This type represents those
/// needs.
///
/// Once construction is finished, the builder will convert these states to a
/// [`nfa::thompson::State`](crate::nfa::thompson::State). This conversion not
/// only results in a simpler representation, but in some cases, entire classes
/// of states are completely removed (such as [`State::Empty`]).
#[derive(Clone, Debug, Eq, PartialEq)]
enum State {
    /// An empty state whose only purpose is to forward the automaton to
    /// another state via an unconditional epsilon transition.
    ///
    /// Unconditional epsilon transitions are quite useful during the
    /// construction of an NFA, as they permit the insertion of no-op
    /// placeholders that make it easier to compose NFA sub-graphs. When
    /// the Thompson NFA builder produces a final NFA, all unconditional
    /// epsilon transitions are removed, and state identifiers are remapped
    /// accordingly.
    Empty {
        /// The next state that this state should transition to.
        next: StateID,
    },
    /// A state that only transitions to another state if the current input
    /// byte is in a particular range of bytes.
    ByteRange { trans: Transition },
    /// A state with possibly many transitions, represented in a sparse
    /// fashion. Transitions must be ordered lexicographically by input range
    /// and be non-overlapping. As such, this may only be used when every
    /// transition has equal priority. (In practice, this is only used for
    /// encoding large UTF-8 automata.) In contrast, a `Union` state has each
    /// alternate in order of priority. Priority is used to implement greedy
    /// matching and also alternations themselves, e.g., `abc|a` where `abc`
    /// has priority over `a`.
    ///
    /// To clarify, it is possible to remove `Sparse` and represent all things
    /// that `Sparse` is used for via `Union`. But this creates a more bloated
    /// NFA with more epsilon transitions than is necessary in the special case
    /// of character classes.
    Sparse { transitions: Vec<Transition> },
    /// A conditional epsilon transition satisfied via some sort of
    /// look-around.
    Look { look: Look, next: StateID },
    /// An empty state that records the start of a capture location. This is an
    /// unconditional epsilon transition like `Empty`, except it can be used to
    /// record position information for a capture group when using the NFA for
    /// search.
    CaptureStart {
        /// The ID of the pattern that this capture was defined.
        pattern_id: PatternID,
        /// The capture group index that this capture state corresponds to.
        /// The capture group index is always relative to its corresponding
        /// pattern. Therefore, in the presence of multiple patterns, both the
        /// pattern ID and the capture group index are required to uniquely
        /// identify a capturing group.
        group_index: SmallIndex,
        /// The next state that this state should transition to.
        next: StateID,
    },
    /// An empty state that records the end of a capture location. This is an
    /// unconditional epsilon transition like `Empty`, except it can be used to
    /// record position information for a capture group when using the NFA for
    /// search.
    CaptureEnd {
        /// The ID of the pattern that this capture was defined.
        pattern_id: PatternID,
        /// The capture group index that this capture state corresponds to.
        /// The capture group index is always relative to its corresponding
        /// pattern. Therefore, in the presence of multiple patterns, both the
        /// pattern ID and the capture group index are required to uniquely
        /// identify a capturing group.
        group_index: SmallIndex,
        /// The next state that this state should transition to.
        next: StateID,
    },
    /// An alternation such that there exists an epsilon transition to all
    /// states in `alternates`, where matches found via earlier transitions
    /// are preferred over later transitions.
    Union { alternates: Vec<StateID> },
    /// An alternation such that there exists an epsilon transition to all
    /// states in `alternates`, where matches found via later transitions are
    /// preferred over earlier transitions.
    ///
    /// This "reverse" state exists for convenience during compilation that
    /// permits easy c
```

---

# OUTRO - builder.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\builder.rs
**SHA:** 352db30f01ecd4c5
**Timestamp:** 2026-08-28T02:36:14.721713
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub(super) after_start: Option<Callback>,
- after_start: None,
- self.after_start = Some(std::sync::Arc::new(f));
- /// let poll_start = poll_start_counter.clone();

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg_attr(loom, allow(unused_imports))]

use crate::runtime::handle::Handle;
use crate::runtime::{
    blocking, driver, Callback, HistogramBuilder, Runtime, TaskCallback, TimerFlavor,
};
#[cfg(tokio_unstable)]
use crate::runtime::{metrics::HistogramConfiguration, TaskMeta};

use crate::runtime::{LocalOptions, LocalRuntime};
use crate::util::rand::{RngSeed, RngSeedGenerator};

use crate::runtime::blocking::BlockingPool;
use crate::runtime::scheduler::CurrentThread;
use std::fmt;
use std::io;
use std::thread::ThreadId;
use std::time::Duration;

/// Builds Tokio Runtime with custom configuration values.
///
/// Methods can be chained in order to set the configuration values. The
/// Runtime is constructed by calling [`build`].
///
/// New instances of `Builder` are obtained via [`Builder::new_multi_thread`]
/// or [`Builder::new_current_thread`].
///
/// See function level documentation for details on the various configuration
/// settings.
///
/// [`build`]: method@Self::build
/// [`Builder::new_multi_thread`]: method@Self::new_multi_thread
/// [`Builder::new_current_thread`]: method@Self::new_current_thread
///
/// # Examples
///
/// ```
/// # #[cfg(not(target_family = "wasm"))]
/// # {
/// use tokio::runtime::Builder;
///
/// fn main() {
///     // build runtime
///     let runtime = Builder::new_multi_thread()
///         .worker_threads(4)
///         .thread_name("my-custom-name")
///         .thread_stack_size(3 * 1024 * 1024)
///         .build()
///         .unwrap();
///
///     // use runtime ...
/// }
/// # }
/// ```
pub struct Builder {
    /// Runtime type
    kind: Kind,

    /// Name of the runtime.
    name: Option<String>,

    /// Whether or not to enable the I/O driver
    enable_io: bool,
    nevents: usize,

    /// Whether or not to enable the time driver
    enable_time: bool,

    /// Whether or not the clock should start paused.
    start_paused: bool,

    /// The number of worker threads, used by Runtime.
    ///
    /// Only used when not using the current-thread executor.
    worker_threads: Option<usize>,

    /// Cap on thread usage.
    max_blocking_threads: usize,

    /// Name fn used for threads spawned by the runtime.
    pub(super) thread_name: ThreadNameFn,

    /// Stack size used for threads spawned by the runtime.
    pub(super) thread_stack_size: Option<usize>,

    /// Callback to run after each thread starts.
    pub(super) after_start: Option<Callback>,

    /// To run before each worker thread stops
    pub(super) before_stop: Option<Callback>,

    /// To run before each worker thread is parked.
    pub(super) before_park: Option<Callback>,

    /// To run after each thread is unparked.
    pub(super) after_unpark: Option<Callback>,

    /// To run before each task is spawned.
    pub(super) before_spawn: Option<TaskCallback>,

    /// To run before each poll
    #[cfg(tokio_unstable)]
    pub(super) before_poll: Option<TaskCallback>,

    /// To run after each poll
    #[cfg(tokio_unstable)]
    pub(super) after_poll: Option<TaskCallback>,

    /// To run after each task is terminated.
    pub(super) after_termination: Option<TaskCallback>,

    /// Customizable keep alive timeout for `BlockingPool`
    pub(super) keep_alive: Option<Duration>,

    /// How many ticks before pulling a task from the global/remote queue?
    ///
    /// When `None`, the value is unspecified and behavior details are left to
    /// the scheduler. Each scheduler flavor could choose to either pick its own
    /// default value or use some other strategy to decide when to poll from the
    /// global queue. For example, the multi-threaded scheduler uses a
    /// self-tuning strategy based on mean task poll times.
    pub(super) global_queue_interval: Option<u32>,

    /// How many ticks before yielding to the driver for timer and I/O events?
    pub(super) event_interval: u32,

    /// When true, the multi-threade scheduler LIFO slot should not be used.
    ///
    /// This option should only be exposed as unstable.
    pub(super) disable_lifo_slot: bool,

    /// Specify a random number generator seed to provide deterministic results
    pub(super) seed_generator: RngSeedGenerator,

    /// When true, enables task poll count histogram instrumentation.
    pub(super) metrics_poll_count_histogram_enable: bool,

    /// Configures the task poll count histogram
    pub(super) metrics_poll_count_histogram: HistogramBuilder,

    /// When true, enables task schedule latency instrumentation.
    pub(super) metrics_schedule_latency_histogram_enabled: bool,

    /// Configures the task schedule latency histogram.
    pub(super) metrics_schedule_latency_histogram: HistogramBuilder,

    #[cfg(tokio_unstable)]
    pub(super) unhandled_panic: UnhandledPanic,

    timer_flavor: TimerFlavor,

    /// Whether or not to enable eager hand-off for the I/O and time drivers (in
    /// `tokio_unstable`).
    enable_eager_driver_handoff: bool,
}

cfg_unstable! {
    /// How the runtime should respond 
```

---

# OUTRO - builder.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerotrie-0.2.4\src\builder\nonconst\builder.rs
**SHA:** ee6140c47552202e
**Timestamp:** 2026-08-28T02:37:44.946100
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut start = 0;

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use core::cmp::Ordering;

use super::super::branch_meta::BranchMeta;
use super::store::NonConstLengthsStack;
use super::store::TrieBuilderStore;
use crate::builder::slice_indices::ByteSliceWithIndices;
use crate::byte_phf::PerfectByteHashMapCacheOwned;
use crate::error::ZeroTrieBuildError;
use crate::options::*;
use crate::varint;
use alloc::vec::Vec;

/// A low-level builder for [`ZeroTrie`](crate::ZeroTrie). Supports all options.
pub(crate) struct ZeroTrieBuilder<S> {
    data: S,
    phf_cache: PerfectByteHashMapCacheOwned,
    options: ZeroTrieBuilderOptions,
}

impl<S: TrieBuilderStore> ZeroTrieBuilder<S> {
    /// Returns the trie data as a `Vec<u8>`.
    pub fn to_bytes(&self) -> Vec<u8> {
        self.data.atbs_to_bytes()
    }

    /// Prepends a byte value to the front of the builder. If it is ASCII, an ASCII
    /// node is prepended. If it is non-ASCII, if there is already a span node at
    /// the front, we modify the span node to add the new byte; otherwise, we create
    /// a new span node. Returns the delta in length, which is either 1 or 2.
    fn prepend_ascii(&mut self, ascii: u8) -> Result<usize, ZeroTrieBuildError> {
        if ascii <= 127 {
            self.data.atbs_push_front(ascii);
            Ok(1)
        } else if matches!(self.options.ascii_mode, AsciiMode::BinarySpans) {
            if let Some(old_front) = self.data.atbs_pop_front() {
                let old_byte_len = self.data.atbs_len() + 1;
                if old_front & 0b11100000 == 0b10100000 {
                    // Extend an existing span
                    // Unwrap OK: there is a varint at this location in the buffer
                    #[expect(clippy::unwrap_used)]
                    let old_span_size =
                        varint::try_read_varint_meta3_from_tstore(old_front, &mut self.data)
                            .unwrap();
                    self.data.atbs_push_front(ascii);
                    let varint_array = varint::write_varint_meta3(old_span_size + 1);
                    self.data.atbs_extend_front(varint_array.as_slice());
                    self.data.atbs_bitor_assign(0, 0b10100000);
                    let new_byte_len = self.data.atbs_len();
                    return Ok(new_byte_len - old_byte_len);
                } else {
                    self.data.atbs_push_front(old_front);
                }
            }
            // Create a new span
            self.data.atbs_push_front(ascii);
            self.data.atbs_push_front(0b10100001);
            Ok(2)
        } else {
            Err(ZeroTrieBuildError::NonAsciiError)
        }
    }

    /// Prepends a value node to the front of the builder. Returns the
    /// delta in length, which depends on the size of the varint.
    #[must_use]
    fn prepend_value(&mut self, value: usize) -> usize {
        let varint_array = varint::write_varint_meta3(value);
        self.data.atbs_extend_front(varint_array.as_slice());
        self.data.atbs_bitor_assign(0, 0b10000000);
        varint_array.len()
    }

    /// Prepends a branch node to the front of the builder. Returns the
    /// delta in length, which depends on the size of the varint.
    #[must_use]
    fn prepend_branch(&mut self, value: usize) -> usize {
        let varint_array = varint::write_varint_meta2(value);
        self.data.atbs_extend_front(varint_array.as_slice());
        self.data.atbs_bitor_assign(0, 0b11000000);
        varint_array.len()
    }

    /// Prepends multiple arbitrary bytes to the front of the builder. Returns the
    /// delta in length, which is the length of the slice.
    #[must_use]
    fn prepend_slice(&mut self, s: &[u8]) -> usize {
        self.data.atbs_extend_front(s);
        s.len()
    }

    /// Builds a [`ZeroTrie`](crate::ZeroTrie) from an iterator of bytes. It first collects and sorts the iterator.
    pub fn from_bytes_iter<K: AsRef<[u8]>, I: IntoIterator<Item = (K, usize)>>(
        iter: I,
        options: ZeroTrieBuilderOptions,
    ) -> Result<Self, ZeroTrieBuildError> {
        let items = Vec::<(K, usize)>::from_iter(iter);
        let mut items = items
            .iter()
            .map(|(k, v)| (k.as_ref(), *v))
            .collect::<Vec<(&[u8], usize)>>();
        items.sort_by(|a, b| cmp_keys_values(options, *a, *b));
        let ascii_str_slice = items.as_slice();
        let byte_str_slice = ByteSliceWithIndices::from_byte_slice(ascii_str_slice);
        Self::from_sorted_tuple_slice_impl(byte_str_slice, options)
    }

    /// Builds a [`ZeroTrie`](crate::ZeroTrie) with the given items and options. Assumes that the items are sorted,
    /// except for a case-insensitive trie where the items are re-sorted.
    ///
    /// # Panics
    ///
    /// May panic if the items are not sorted.
    pub fn from_sorted_tuple_slic
```
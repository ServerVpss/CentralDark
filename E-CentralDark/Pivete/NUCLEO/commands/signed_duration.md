# COMANDO - signed_duration.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\src\signed_duration.rs
**SHA:** 8b63e5a85f81c20e
**Timestamp:** 2026-08-28T02:36:06.130002
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
//! The [`SignedDuration`] struct and its associated `impl`s.

use core::cmp::Ordering;
use core::fmt;
use core::hash::{Hash, Hasher};
use core::iter::Sum;
use core::ops::{Add, AddAssign, Div, DivAssign, Mul, MulAssign, Neg, Sub, SubAssign};
use core::time::Duration as StdDuration;
#[cfg(feature = "std")]
use std::time::SystemTime;

use deranged::ri32;
use num_conv::prelude::*;

#[cfg(feature = "std")]
#[expect(deprecated)]
use crate::Instant;
use crate::error;
use crate::internal_macros::const_try_opt;
use crate::unit::*;

#[derive(Debug)]
enum FloatConstructorError {
    Nan,
    NegOverflow,
    PosOverflow,
}

/// By explicitly inserting this enum where padding is expected, the compiler is able to better
/// perform niche value optimization.
#[repr(u32)]
#[derive(Debug, Clone, Copy)]
pub(crate) enum Padding {
    #[allow(clippy::missing_docs_in_private_items)]
    Optimize,
}

/// The type of the `nanosecond` field of `SignedDuration`.
type Nanoseconds =
    ri32<{ -Nanosecond::per_t::<i32>(Second) + 1 }, { Nanosecond::per_t::<i32>(Second) - 1 }>;

/// A span of time with nanosecond precision.
///
/// Each `SignedDuration` is composed of a whole number of seconds and a fractional part represented
/// in nanoseconds.
///
/// This implementation allows for negative durations, unlike [`core::time::Duration`].
#[repr(C)]
#[derive(Clone, Copy)]
pub struct SignedDuration {
    /// Number of whole seconds.
    seconds: i64,
    /// Number of nanoseconds within the second. The sign always matches the `seconds` field.
    // Sign must match that of `seconds` (though this is not a safety requirement).
    nanoseconds: Nanoseconds,
    _padding: Padding,
}

impl fmt::Debug for SignedDuration {
    #[inline]
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("SignedDuration")
            .field("seconds", &self.seconds)
            .field("nanoseconds", &self.nanoseconds)
            .finish()
    }
}

impl PartialEq for SignedDuration {
    #[inline]
    fn eq(&self, other: &Self) -> bool {
        self.as_int_for_equality() == other.as_int_for_equality()
    }
}

impl Eq for SignedDuration {}

impl PartialOrd for SignedDuration {
    #[inline]
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for SignedDuration {
    #[inline]
    fn cmp(&self, other: &Self) -> Ordering {
        self.seconds
            .cmp(&other.seconds)
            .then_with(|| self.nanoseconds.cmp(&other.nanoseconds))
    }
}

impl Hash for SignedDuration {
    fn hash<H>(&self, state: &mut H)
    where
        H: Hasher,
    {
        self.as_int_for_equality().hash(state);
    }
}

impl Default for SignedDuration {
    #[inline]
    fn default() -> Self {
        Self::ZERO
    }
}

/// This is adapted from the [`std` implementation][std], which uses mostly bit operations to ensure
/// the highest precision:
///
/// Changes from `std` are marked and explained below.
///
/// [std]: https://github.com/rust-lang/rust/blob/3a37c2f0523c87147b64f1b8099fc9df22e8c53e/library/core/src/time.rs#L1262-L1340
#[rustfmt::skip] // Skip `rustfmt` because it reformats the arguments of the macro weirdly.
macro_rules! try_from_secs {
    (
        secs = $secs: expr,
        mantissa_bits = $mant_bits: literal,
        exponent_bits = $exp_bits: literal,
        offset = $offset: literal,
        bits_ty = $bits_ty:ty,
        bits_ty_signed = $bits_ty_signed:ty,
        double_ty = $double_ty:ty,
        float_ty = $float_ty:ty,
    ) => {{
        'value: {
            const MIN_EXP: i16 = 1 - (1i16 << $exp_bits) / 2;
            const MANT_MASK: $bits_ty = (1 << $mant_bits) - 1;
            const EXP_MASK: $bits_ty = (1 << $exp_bits) - 1;

            // Change from std: No error check for negative values necessary.

            let bits = $secs.to_bits();
            let mant = (bits & MANT_MASK) | (MANT_MASK + 1);
            let exp = ((bits >> $mant_bits) & EXP_MASK) as i16 + MIN_EXP;

            let (secs, nanos) = if exp < -31 {
                // the input represents less than 1ns and can not be rounded to it
                (0u64, 0u32)
            } else if exp < 0 {
                // the input is less than 1 second
                let t = (mant as $double_ty) << ($offset + exp);
                let nanos_offset = $mant_bits + $offset;
                #[allow(trivial_numeric_casts)]
                let nanos_tmp = Nanosecond::per_t::<u128>(Second) * t as u128;
                let nanos = (nanos_tmp >> nanos_offset) as u32;

                let rem_mask = (1 << nanos_offset) - 1;
                let rem_msb_mask = 1 << (nanos_offset - 1);
                let rem = nanos_tmp & rem_mask;
                let is_tie = rem == rem_msb_mask;
                let is_even = (nanos & 1) == 0;
                let rem_msb = nanos_tmp & rem_msb_mask == 0;
                let add_ns = !(rem_msb || (is_even && is_tie));

                // f32 does not have enough pr
```